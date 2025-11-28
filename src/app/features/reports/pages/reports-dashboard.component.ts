import { ChangeDetectionStrategy, Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';

import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';

import { ReportsService } from '@features/reports/services/reports.service';
import { ReportMetrics } from '@features/reports/models/report-metrics';
import { StatCardComponent } from '@features/dashboard/components/stat-card/stat-card.component';

Chart.register(...registerables);

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    BaseChartDirective,
    StatCardComponent
  ],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsDashboardComponent implements OnInit {
  private reportsService = inject(ReportsService);

  isLoading = signal(true);
  metrics = signal<ReportMetrics | null>(null);

  bookingsByDateChart: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'Reservas por día',
        data: [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  };

  bookingsBySpaceChart: ChartConfiguration<'doughnut'> = {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#84cc16'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right'
        }
      }
    }
  };



  usersByRoleChart: ChartConfiguration<'pie'> = {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [
          '#10b981', // Verde para el primer rol
          '#3b82f6', // Azul para el segundo rol
          '#f59e0b', // Ámbar para el tercer rol
          '#ef4444', // Rojo para roles adicionales
          '#8b5cf6'  // Morado para roles adicionales
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const dataset = context.dataset.data as number[];
              const total = dataset.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading.set(true);

    this.reportsService.getReportMetrics().subscribe({
      next: (metrics) => {
        this.metrics.set(metrics);
        this.updateCharts(metrics);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.isLoading.set(false);
      }
    });
  }

  private updateCharts(metrics: ReportMetrics): void {
    // Actualizar gráfico de reservas por fecha
    this.bookingsByDateChart.data.labels = metrics.bookingsByDate.map(item =>
      new Date(item.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    );
    this.bookingsByDateChart.data.datasets[0].data = metrics.bookingsByDate.map(item => item.count);

    // Actualizar gráfico de reservas por espacio
    const topSpaces = metrics.bookingsBySpace.slice(0, 8); // Mostrar solo los top 8
    this.bookingsBySpaceChart.data.labels = topSpaces.map(item => item.spaceName);
    this.bookingsBySpaceChart.data.datasets[0].data = topSpaces.map(item => item.count);

    // Actualizar gráfico de usuarios por rol
    this.usersByRoleChart.data.labels = metrics.usersByRole.map(item => item.role);
    this.usersByRoleChart.data.datasets[0].data = metrics.usersByRole.map(item => item.count);
  }

  get statsCards() {
    const metrics = this.metrics();
    if (!metrics) return [];

    return [
      {
        title: 'Total Usuarios',
        value: metrics.totalUsers,
        subtitle: 'Usuarios registrados',
        icon: 'people'
      },
      {
        title: 'Espacios Deportivos',
        value: metrics.totalSpaces,
        subtitle: `${metrics.activeSpaces} activos`,
        icon: 'sports_volleyball'
      },
      {
        title: 'Total Reservas',
        value: metrics.totalBookings,
        subtitle: 'Reservas registradas',
        icon: 'event'
      },
      {
        title: 'Este Mes',
        value: metrics.bookingsThisMonth,
        subtitle: 'Reservas del mes',
        icon: 'calendar_today'
      },
      {
        title: 'Esta Semana',
        value: metrics.bookingsThisWeek,
        subtitle: 'Reservas de la semana',
        icon: 'date_range'
      },
      {
        title: 'Espacio Popular',
        value: metrics.mostUsedSpace.bookings,
        subtitle: metrics.mostUsedSpace.name,
        icon: 'trending_up'
      }
    ];
  }
}
