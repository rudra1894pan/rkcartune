import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../../core/services/booking.service';
import { CarService } from '../../../core/services/car.service';
import { Booking, BookingStatus } from '../../../core/models';

@Component({
  selector: 'app-manage-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-bookings.component.html',
})
export class ManageBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;

  constructor(private bookingService: BookingService, private carService: CarService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (res) => {
        this.bookings = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  updateStatus(booking: Booking, status: BookingStatus): void {
    this.bookingService.updateStatus(booking._id, status).subscribe((res) => {
      booking.status = res.data.status;
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
