export interface ReportMetrics {
  totalUsers: number;
  totalSpaces: number;
  totalBookings: number;
  activeUsers: number;
  activeSpaces: number;
  bookingsThisMonth: number;
  bookingsThisWeek: number;
  mostUsedSpace: {
    name: string;
    bookings: number;
  };
  bookingsByDate: {
    date: string;
    count: number;
  }[];
  bookingsBySpace: {
    spaceName: string;
    count: number;
  }[];
  usersByRole: {
    role: string;
    count: number;
    percentage: number;
  }[];
}
