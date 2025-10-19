import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, type OnInit } from '@angular/core';
import { ActionCardComponent } from '@features/dashboard/components/action-card/action-card.component';
import { StatCardComponent } from './components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StatCardComponent, ActionCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  stats = [
    { title: 'Reservas Totales', value: 156, subtitle: '+12% desde el mes pasado', icon: 'calendar_today' },
    { title: 'Usuarios Activos', value: 342, subtitle: '+8% desde el mes pasado', icon: 'person' },
    { title: 'Instalaciones', value: 6, subtitle: '4 en uso actualmente', icon: 'building' },
    { title: 'Solicitudes Pendientes', value: 8, subtitle: 'Requieren aprobación', icon: 'search_activity' },
  ];

  actions = [
    { title: 'Reservas', description: 'Consultar y gestionar reservas de espacios', buttonText: 'Ver Reservas', buttonIcon: 'calendar_today', route: '/reservas' },
    { title: 'Instalaciones', description: 'Administrar espacios deportivos', buttonText: 'Gestionar Instalaciones', buttonIcon: 'apartment', route: '/instalaciones' },
    { title: 'Reportes', description: 'Estadísticas y análisis de uso', buttonText: 'Ver Reportes', buttonIcon: 'bar_chart', route: '/reportes' },
    { title: 'Gestión de Usuarios', description: 'Administrar usuarios y roles del sistema', buttonText: 'Gestionar Usuarios', buttonIcon: 'group', route: '/usuarios' },
  ];
}
