import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal, inject, OnInit } from '@angular/core';
import { ActionCardComponent } from '@features/dashboard/components/action-card/action-card.component';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { UserState } from '@app/state/UserState';
import { UserService } from '@features/users/services/user.service';

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
    return {
      email: current?.email ?? 'Usuario',
      role: current?.role ?? 'Administrador'
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

  actions = [
    { title: 'Gestión de Usuarios', description: 'Administrar usuarios y roles del sistema', buttonText: 'Gestionar Usuarios', buttonIcon: 'group', route: '/usuarios' },
    { title: 'Reservas', description: 'Consultar y gestionar reservas de espacios', buttonText: 'Ver Reservas', buttonIcon: 'calendar_today', route: '/reservas' },
    { title: 'Espacio Deportivos', description: 'Administrar espacios deportivos', buttonText: 'Gestionar Espacios Deportivos', buttonIcon: 'sports_volleyball', route: '/espacios-deportivos' },
    { title: 'Reportes', description: 'Estadísticas y análisis de uso', buttonText: 'Ver Reportes', buttonIcon: 'bar_chart', route: '/reportes' }
  ];
}
