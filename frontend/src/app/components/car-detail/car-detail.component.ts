import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  imports: [CommonModule, BookingModalComponent],
  templateUrl: './car-detail.component.html',
})
export class CarDetailComponent implements OnInit {
  car: Car | null = null;
  loading = true;
  errorMessage: string | null = null;
  bookingOpen = false;
  activeImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private carService: CarService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'No car specified.';
      this.loading = false;
      return;
    }

    this.carService
      .getCarById(id)
      .pipe(
        catchError(() => {
          this.errorMessage = 'This listing could not be found — it may have been sold or removed.';
          return of(null);
        })
      )
      .subscribe((res) => {
        this.loading = false;
        if (res) this.car = res.data;
      });
  }

  openBooking(): void {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.bookingOpen = true;
  }

  imageUrl(path: string): string {
    return this.carService.resolveImageUrl(path);
  }

  get activeImage(): string {
    if (!this.car?.images?.length) return '';
    return this.imageUrl(this.car.images[this.activeImageIndex] || this.car.images[0]);
  }

  selectImage(index: number): void {
    this.activeImageIndex = index;
  }
}
