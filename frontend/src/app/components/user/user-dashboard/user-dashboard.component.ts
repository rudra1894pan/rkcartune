import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { BookingService } from '../../../core/services/booking.service';
import { CarService } from '../../../core/services/car.service';
import { Booking } from '../../../core/models';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent implements OnInit {
  recentBookings: Booking[] = [];
  loading = true;

  constructor(public auth: AuthService, private bookingService: BookingService, private carService: CarService) {}

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.recentBookings = res.data.slice(0, 3);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  imageFor(booking: Booking): string {
    return this.carService.resolveImageUrl(booking.car.images?.[0] || '');
  }
}
