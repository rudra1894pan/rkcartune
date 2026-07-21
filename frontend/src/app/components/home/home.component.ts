import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  cars: Car[] = [];
  brands: string[] = [];
  activeBrand = '';
  loading = true;
  errorMessage: string | null = null;
  loadingMessage = 'Waking up the showroom… this can take up to a minute on the first visit.';

  searchControl = new FormControl('', { nonNullable: true });

  constructor(private carService: CarService, public auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchBrands();
    this.fetchCars();

    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.activeBrand = '';
      this.fetchCars();
    });
  }

  fetchBrands(): void {
    this.carService.getBrands().subscribe({
      next: (res) => (this.brands = res.data),
      error: () => (this.brands = []),
    });
  }

  fetchCars(): void {
    this.loading = true;
    this.errorMessage = null;

    const slowLoadTimer = setTimeout(() => {
      if (this.loading) {
        this.loadingMessage = 'Still waking up the server… almost there, thanks for your patience.';
      }
    }, 8000);

    this.carService
      .getCars({ search: this.searchControl.value, brand: this.activeBrand })
      .pipe(
        catchError(() => {
          this.errorMessage = 'We could not reach the showroom service. Confirm the API is running and try again.';
          return of(null);
        })
      )
      .subscribe((res) => {
        clearTimeout(slowLoadTimer);
        this.loading = false;
        this.loadingMessage = 'Waking up the showroom… this can take up to a minute on the first visit.';
        if (res) this.cars = res.data;
      });
  }

  selectBrand(brand: string): void {
    this.activeBrand = this.activeBrand === brand ? '' : brand;
    this.searchControl.setValue('', { emitEvent: false });
    this.fetchCars();
  }

  viewDetails(car: Car): void {
    this.router.navigate(['/cars', car._id]);
  }

  trackByCarId(_index: number, car: Car): string {
    return car._id;
  }

  imageFor(car: Car): string {
    return this.carService.resolveImageUrl(car.images?.[0] || '');
  }
}