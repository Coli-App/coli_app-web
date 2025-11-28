import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { BookingsService } from '@features/bookings/services/bookings.service';
import { SportSpacesService } from '@features/sport-spaces/services/sport-spaces.service';
import { UserService } from '@features/users/services/user.service';
import { ROLE_LABELS } from '@core/consts/user.roles.consts';
import { ReportMetrics } from '@features/reports/models/report-metrics';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(
    private bookingsService: BookingsService,
    private spacesService: SportSpacesService,
    private userService: UserService
  ) {}

  getReportMetrics(): Observable<ReportMetrics> {
    return forkJoin({
      bookings: this.bookingsService.getAllBookings(),
      spaces: this.spacesService.getAllSpaces(),
      users: this.userService.getAllUsers()
    }).pipe(
      map(({ bookings, spaces, users }) => {
        // Calcular métricas básicas
        const totalBookings = bookings.length;
        const totalSpaces = spaces.length;
        const activeSpaces = spaces.filter(space => space.state === 'Activo').length;
        const totalUsers = users.length;

        // Calcular usuarios por rol
        const usersByRole = this.calculateUsersByRole(users);

        // Calcular reservas por fecha (últimos 30 días)
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const recentBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= thirtyDaysAgo;
        });

        const bookingsThisMonth = recentBookings.length;

        // Calcular reservas por semana (últimos 7 días)
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const bookingsThisWeek = bookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate >= sevenDaysAgo;
        }).length;

        // Reservas por espacio
        const bookingsBySpace = this.calculateBookingsBySpace(bookings, spaces);

        // Espacio más utilizado
        const mostUsedSpace = bookingsBySpace.length > 0
          ? bookingsBySpace.reduce((prev, current) =>
              prev.count > current.count ? prev : current
            )
          : { spaceName: 'N/A', count: 0 };

        // Reservas por fecha (últimos 30 días)
        const bookingsByDate = this.calculateBookingsByDate(recentBookings);

        return {
          totalUsers,
          totalSpaces,
          totalBookings,
          activeUsers: totalUsers,
          activeSpaces,
          usersByRole,
          bookingsThisMonth,
          bookingsThisWeek,
          mostUsedSpace: {
            name: mostUsedSpace.spaceName,
            bookings: mostUsedSpace.count
          },
          bookingsByDate,
          bookingsBySpace
        } as ReportMetrics;
      })
    );
  }

  private calculateBookingsBySpace(bookings: any[], spaces: any[]): { spaceName: string; count: number }[] {
    const spaceMap = new Map(spaces.map(space => [space.id, space.name]));
    const bookingCounts = new Map<string, number>();

    bookings.forEach(booking => {
      const spaceName = spaceMap.get(booking.espacio_id) || 'Espacio desconocido';
      bookingCounts.set(spaceName, (bookingCounts.get(spaceName) || 0) + 1);
    });

    return Array.from(bookingCounts.entries())
      .map(([spaceName, count]) => ({ spaceName, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateBookingsByDate(bookings: any[]): { date: string; count: number }[] {
    const dateCounts = new Map<string, number>();

    bookings.forEach(booking => {
      const date = booking.date;
      dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
    });

    const last30Days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({
        date: dateStr,
        count: dateCounts.get(dateStr) || 0
      });
    }

    return last30Days;
  }

  private calculateUsersByRole(users: any[]): { role: string; count: number; percentage: number }[] {
    const roleCounts = new Map<string, number>();
    const totalUsers = users.length;

    users.forEach(user => {
      const role = user.rol || 'student';
      roleCounts.set(role, (roleCounts.get(role) || 0) + 1);
    });

    return Array.from(roleCounts.entries())
      .map(([role, count]) => ({
        role: ROLE_LABELS[role] || role,
        count,
        percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
    }
}
