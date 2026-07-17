import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { BookingService } from '../../../core/services/booking.service';
import { CarService } from '../../../core/services/car.service';
import { Booking } from '../../../core/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  errorMessage: string | null = null;

  constructor(private bookingService: BookingService, private carService: CarService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.bookingService
      .getMyBookings()
      .pipe(
        catchError(() => {
          this.errorMessage = 'Could not load your bookings right now.';
          return of(null);
        })
      )
      .subscribe((res) => {
        this.loading = false;
        if (res) this.bookings = res.data;
      });
  }

  cancel(booking: Booking): void {
    this.bookingService.cancelBooking(booking._id).subscribe(() => {
      this.bookings = this.bookings.filter((b) => b._id !== booking._id);
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'text-nitro-lime border-nitro-lime/40';
      case 'cancelled':
        return 'text-red-400 border-red-400/40';
      case 'completed':
        return 'text-text-muted border-line';
      default:
        return 'text-tuner-orange border-tuner-orange/40';
    }
  }

  imageFor(booking: Booking): string {
    return this.carService.resolveImageUrl(booking.car.images?.[0] || '');
  }
}
