import { ChangeDetectionStrategy, Component, computed, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BookingsService } from '@features/bookings/services/bookings.service';
import { BookingResponse } from '@features/bookings/models/booking-response';
import { BookingStats } from '@features/bookings/models/booking.stats';
import { UserState } from '@app/state/UserState';
import { StatCardComponent } from '@features/dashboard/components/stat-card/stat-card.component';
import { BookingFormComponent } from '@features/bookings/components/booking-form/booking-form.component';
import { SportSpacesService } from '@app/features/sport-spaces/services/sport-spaces.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDeleteDialogComponent, ConfirmDeleteData } from '@core/shared/components/atoms/confirm-delete-dialog/confirm-delete-dialog.component';

interface BookingWithSpace extends BookingResponse {
  spaceName?: string;
  isPast?: boolean;
}

@Component({
  selector: 'app-bookings-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    StatCardComponent,
  ],
  templateUrl: './bookings-management.component.html',
  styleUrl: './bookings-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsManagementComponent implements OnInit, OnDestroy {
  private bookingsService = inject(BookingsService);
  private spacesService = inject(SportSpacesService);
  private destroy$ = new Subject<void>();
  private userState = inject(UserState);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  searchValue = signal('');
  bookings = signal<BookingWithSpace[]>([]);

  displayedColumns: string[] = ['espacio', 'fecha', 'hora', 'personas', 'estado', 'acciones'];

  filteredBookings = computed(() => {
    const term = this.searchValue().toLowerCase();
    return this.bookings().filter(
      (booking) =>
        (booking.spaceName?.toLowerCase().includes(term) || false) ||
        booking.date.toLowerCase().includes(term)
    );
  });

  stats = computed<BookingStats[]>(() => {
    const allBookings = this.bookings();
    const totalBookings = allBookings.length;
    const today = new Date().toISOString().split('T')[0];
    const upcomingBookings = allBookings.filter(b => b.date >= today).length;

    return [
      {
        title: 'Mis Reservas',
        value: totalBookings,
        subtitle: 'Total de reservas activas',
        icon: 'calendar_today',
      },
      {
        title: 'Completadas',
        value: totalBookings - upcomingBookings,
        subtitle: 'Reservas pasadas',
        icon: 'event_note',
      },
    ];
  });

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(): void {
    const userId = this.userState.userId();
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    this.bookingsService.getBookingsByCreator(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          const spaceRequests = bookings.map(booking =>
            this.spacesService.getSpaceById(booking.espacio_id)
          );

          forkJoin(spaceRequests)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (spaces) => {
                const today = new Date().toISOString().split('T')[0];
                const enrichedBookings: BookingWithSpace[] = bookings.map((booking, index) => ({
                  ...booking,
                  spaceName: spaces[index]?.name || 'Espacio desconocido',
                  isPast: booking.date < today
                }));
                this.bookings.set(enrichedBookings);
              },
              error: (error) => {
                console.error('Error al cargar espacios:', error);
                this.bookings.set(bookings as BookingWithSpace[]);
              }
            });
        },
        error: (error) => {
          console.error('Error al cargar las reservas:', error);
          this.snackBar.open('Error al cargar las reservas', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(BookingFormComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
      autoFocus: true,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.loadBookings();
        }
      });
  }

  cancelBooking(booking: BookingWithSpace): void {
    if (booking.isPast) {
      this.snackBar.open('No se puede cancelar una reserva que ya pasó', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar'],
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: {
        title: 'Cancelar Reserva',
        itemName: `la reserva de ${booking.spaceName || 'Espacio'}`,
        itemDescription: `Fecha: ${this.formatDate(booking.date)} • ${booking.time_start} - ${booking.time_end}`,
        warningMessage: 'Esta acción no se puede deshacer.'
      } as ConfirmDeleteData,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.performCancelBooking(booking);
        }
      });
  }

  private performCancelBooking(booking: BookingWithSpace): void {
    this.bookingsService.deleteBooking(booking.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.spacesService.getSpaceById(booking.espacio_id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (spaceData) => {
                const newCapacity = spaceData.capacity + booking.people_number;
                const updateSpace = {
                  capacity: newCapacity
                };

                this.spacesService.updateSpace(booking.espacio_id, updateSpace)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: () => {
                      console.log('Capacidad restaurada correctamente');
                      const currentBookings = this.bookings();
                      const updatedBookings = currentBookings.filter(b => b.id !== booking.id);
                      this.bookings.set(updatedBookings);
                    },
                    error: (err) => console.error('Error al restaurar capacidad', err)
                  });
              },
              error: (err) => console.error('Error al obtener datos del espacio', err)
            });

          this.snackBar.open('Reserva cancelada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        },
        error: (error) => {
          console.error('Error al cancelar reserva:', error);
          this.snackBar.open('Error al cancelar la reserva', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        }
      });
  }

  formatDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    return localDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
