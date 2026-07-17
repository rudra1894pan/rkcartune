import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Booking, BookingStatus } from '../models';

export interface CreateBookingPayload {
  carId: string;
  visitDate: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly baseUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(payload: CreateBookingPayload): Observable<{ success: boolean; data: Booking }> {
    return this.http.post<{ success: boolean; data: Booking }>(this.baseUrl, payload);
  }

  getMyBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(`${this.baseUrl}/mine`);
  }

  getAllBookings(): Observable<{ success: boolean; data: Booking[] }> {
    return this.http.get<{ success: boolean; data: Booking[] }>(this.baseUrl);
  }

  updateStatus(id: string, status: BookingStatus): Observable<{ success: boolean; data: Booking }> {
    return this.http.put<{ success: boolean; data: Booking }>(`${this.baseUrl}/${id}/status`, { status });
  }

  cancelBooking(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }
}
