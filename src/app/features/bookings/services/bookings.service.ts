import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { CreateBooking } from '@features/bookings/models/create-booking';
import { BookingResponse } from '@features/bookings/models/booking-response';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  apiUrl = environment.apiUrl;
  model = 'bookings';

  constructor(private http: HttpClient) { }

  getAllBookings(): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.getUrl()}`);
  }

  getBookingsByCreator(id_creator: string): Observable<BookingResponse[]> {
    return this.http.get<BookingResponse[]>(`${this.getUrl()}/creator/${id_creator}`);
  }

  createBooking(booking: CreateBooking): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(`${this.getUrl()}`, booking);
  }

  deleteBooking(id: string): Observable<any> {
    return this.http.delete(`${this.getUrl()}/${id}`);
  }

  getUrl() {
    return `${this.apiUrl}/${this.model}`;
  }
}
