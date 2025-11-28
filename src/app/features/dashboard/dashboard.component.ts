import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { ActionCardComponent } from '@features/dashboard/components/action-card/action-card.component';
import { StatCardComponent } from '@features/dashboard/components/stat-card/stat-card.component';
import { UserState } from '@app/state/UserState';
import { UserService } from '@features/users/services/user.service';
import { ROLE_LABELS } from '@app/core/consts/user.roles.consts';
import { SportSpacesService } from '@app/features/sport-spaces/services/sport-spaces.service';
import { BookingsService } from '@app/features/bookings/services/bookings.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StatCardComponent, ActionCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private sportSpacesService = inject(SportSpacesService);
  private bookingsService = inject(BookingsService);
  private destroy$ = new Subject<void>();

  constructor(private userState: UserState) {}

  readonly user = computed(() => {
    const current = this.userState.currentUser();

    const roleKey = current?.role ?? 'admin';
    const roleLabel = ROLE_LABELS[roleKey] ?? 'Rol desconocido';

    return {
      email: current?.email ?? 'Usuario',
      role: roleLabel,
      roleKey: roleKey
    };
  });

  totalUsers = signal<number>(0);
  totalSportSpaces = signal<number>(0);
  currentUserBookings = signal<number>(0);
  allBookings = signal<number>(0);

  stats = computed(() => {
    const userRole = this.user().roleKey;

    const allStats = [
      { title: 'Usuarios Activos', value: this.totalUsers(), subtitle: 'Total de usuarios registrados', icon: 'person', roles: ['admin']},
      { title: 'Reservas Activas', value: this.currentUserBookings(), subtitle: 'Tu cantidad de reservas activas', icon: 'calendar_today', roles: ['trainer', 'student']},
      { title: 'Reservas', value: this.allBookings(), subtitle: 'Total de reservas en el sistema', icon: 'event_list', roles: ['admin']},
      { title: 'Instalaciones', value: this.totalSportSpaces(), subtitle: 'Total de instalaciones registradas', icon: 'building', roles: ['admin']},
      { title: 'Solicitudes Pendientes', value: 0, subtitle: 'Requieren aprobación', icon: 'search_activity', roles: ['trainer', 'student']},
    ];

    return allStats.filter(stat => stat.roles.includes(userRole));
  });

  ngOnInit(): void {
    this.loadUserCount();
    this.loadSportSpaceCount();
    this.loadBookingsPeerUserCount();
    this.loadBookingsCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserCount(): void {
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.totalUsers.set(users.length);
        },
        error: (error) => {
          console.error('Error al cargar la cantidad de usuarios:', error);
          this.totalUsers.set(0);
        }
      });
  }

  private loadBookingsPeerUserCount(): void {
    this.bookingsService.getBookingsByCreator(this.userState.userId()!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.currentUserBookings.set(bookings.length);
        },
        error: (error) => {
          console.error('Error al cargar la cantidad de reservas:', error);
        }
      });
  }

  private loadBookingsCount(): void {
    this.bookingsService.getAllBookings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (bookings) => {
          this.allBookings.set(bookings.length);
        },
        error: (error) => {
          console.error('Error al cargar la cantidad de reservas:', error);
        }
      });
  }

  private loadSportSpaceCount(): void {
    this.sportSpacesService.getAllSpaces()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (spaces) => {
          this.totalSportSpaces.set(spaces.length);
        },
        error: (error) => {
          console.error('Error al cargar la cantidad de instalaciones:', error);
          this.totalSportSpaces.set(0);
        }
      });
  }

  private allActions = [
    { title: 'Gestión de Usuarios', description: 'Administrar usuarios y roles del sistema', buttonText: 'Gestionar Usuarios', buttonIcon: 'group', route: '/usuarios', roles: ['admin'] },
    { title: 'Reservas', description: 'Consultar y gestionar reservas de espacios', buttonText: 'Ver Reservas', buttonIcon: 'calendar_today', route: '/reservas', roles: ['student', 'trainer'] },
    { title: 'Espacio Deportivos', description: 'Administrar espacios deportivos', buttonText: 'Gestionar Espacios Deportivos', buttonIcon: 'sports_volleyball', route: '/espacios-deportivos', roles: ['admin'] },
    { title: 'Reportes', description: 'Estadísticas y análisis de uso', buttonText: 'Ver Reportes', buttonIcon: 'bar_chart', route: '/reportes', roles: ['admin'] }
  ];

  actions = computed(() => {
    const userRole = this.user().roleKey;
    return this.allActions.filter(action => action.roles.includes(userRole));
  });
}
