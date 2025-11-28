import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, inject, OnInit } from '@angular/core';
import { ActionCardComponent } from '@features/dashboard/components/action-card/action-card.component';
import { StatCardComponent } from '@features/dashboard/components/stat-card/stat-card.component';
import { UserState } from '@app/state/UserState';
import { UserService } from '@features/users/services/user.service';
import { ROLE_LABELS } from '@app/core/consts/user.roles.consts';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StatCardComponent, ActionCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);

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

  stats = computed(() => [
    { title: 'Usuarios Activos', value: this.totalUsers(), subtitle: 'Total de usuarios registrados', icon: 'person' },
    { title: 'Reservas Totales', value: 0, subtitle: '+0% desde el mes pasado', icon: 'calendar_today' },
    { title: 'Instalaciones', value: 0, subtitle: '4 en uso actualmente', icon: 'building' },
    { title: 'Solicitudes Pendientes', value: 0, subtitle: 'Requieren aprobación', icon: 'search_activity' },
  ]);

  ngOnInit(): void {
    this.loadUserCount();
  }

  private loadUserCount(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.totalUsers.set(users.length);
      },
      error: (error) => {
        console.error('Error loading user count:', error);
        this.totalUsers.set(0);
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
