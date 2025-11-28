import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { BookingsService } from '@features/bookings/services/bookings.service';
import { CreateBooking } from '@features/bookings/models/create-booking';
import { UserState } from '@app/state/UserState';
import { SportSpacesService } from '@app/features/sport-spaces/services/sport-spaces.service';
import { UpdateSportSpace } from '@features/sport-spaces/models/update-sport-space';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bookingsService = inject(BookingsService);
  private userState = inject(UserState);
  private spacesService = inject(SportSpacesService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BookingFormComponent>);

  isLoading = signal(false);
  availableSpaces = signal<any[]>([]);
  selectedSpaceCapacity = signal<number>(0);

  bookingForm: FormGroup;

  constructor() {
    this.bookingForm = this.fb.group({
      espacio_id: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time_start: ['', [Validators.required]],
      time_end: ['', [Validators.required]],
      people_number: [1, [Validators.required, Validators.min(1)]],
    });

    this.bookingForm.get('espacio_id')?.valueChanges.subscribe((spaceId) => {
      const selectedSpace = this.availableSpaces().find(s => s.id === spaceId);
      if (selectedSpace) {
        this.selectedSpaceCapacity.set(selectedSpace.capacity);

        this.bookingForm.get('people_number')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(selectedSpace.capacity)
        ]);
        this.bookingForm.get('people_number')?.updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    this.loadSpaces();
  }

  loadSpaces(): void {
    this.spacesService.getAllSpaces().subscribe({
      next: (spaces) => {
        const activeSpaces = spaces.filter(s => s.state === 'Activo' && s.capacity > 0);
        this.availableSpaces.set(activeSpaces);

        if (activeSpaces.length === 0) {
          this.snackBar.open('No hay espacios deportivos disponibles en este momento. Por favor, intenta más tarde.', 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar espacios:', error);
        this.snackBar.open('Error al cargar los espacios disponibles', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onSubmit(): void {
    if (this.bookingForm.valid && !this.isLoading()) {
      const userId = this.userState.userId();
      if (!userId) {
        this.snackBar.open('Error: Usuario no identificado', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      const timeStart = this.bookingForm.value.time_start;
      const timeEnd = this.bookingForm.value.time_end;
      if (timeEnd <= timeStart) {
        this.snackBar.open('La hora de fin debe ser mayor a la hora de inicio', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }

      this.isLoading.set(true);

      const formValue = this.bookingForm.value;
      const booking: CreateBooking = {
        id_creator: userId,
        espacio_id: String(formValue.espacio_id),
        date: this.formatDate(formValue.date),
        time_start: formValue.time_start,
        time_end: formValue.time_end,
        people_number: Number(formValue.people_number),
      };

      this.bookingsService.createBooking(booking).subscribe({
        next: () => {
          const selectedSpace = this.availableSpaces().find(s => s.id === Number(formValue.espacio_id));
          if (selectedSpace) {
            const newCapacity = selectedSpace.capacity - Number(formValue.people_number);
            const updateSpace: UpdateSportSpace = {
              capacity: newCapacity
            };

            this.spacesService.updateSpace(selectedSpace.id, updateSpace).subscribe({
              next: () => console.log('Capacidad actualizada correctamente'),
              error: (err) => console.error('Error al actualizar capacidad', err)
            });
          }

          this.isLoading.set(false);
          this.snackBar.open('Reserva creada exitosamente', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isLoading.set(false);
          const errorMessage = error.error?.details || 'Error al crear la reserva';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    } else {
      this.bookingForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.bookingForm.get(fieldName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['min']) return `El valor mínimo es ${control.errors['min'].min}`;
    if (control.errors['max']) {
      const maxCapacity = control.errors['max'].max;
      if (maxCapacity === 0) {
        return 'Este espacio no tiene capacidad disponible. Intenta reservar en otro momento.';
      }
      return `La capacidad máxima del espacio es ${maxCapacity} personas`;
    }

    return '';
  }

  private formatDate(date: Date): string {
    // Usar UTC para evitar problemas de zona horaria
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get minDate(): Date {
    return new Date();
  }
}
