import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookingService } from '../../core/services/booking.service';
import { Car } from '../../core/models';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking-modal.component.html',
})
export class BookingModalComponent {
  private fb = inject(FormBuilder);

  @Input() car: Car | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() booked = new EventEmitter<void>();

  submitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  form = this.fb.group({
    visitDate: ['', Validators.required],
    message: [''],
  });

  constructor(private bookingService: BookingService) {}

  submit(): void {
    if (!this.car || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    this.bookingService
      .createBooking({
        carId: this.car._id,
        visitDate: this.form.value.visitDate!,
        message: this.form.value.message || '',
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Viewing requested! We will confirm your slot shortly.';
          this.booked.emit();
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err.error?.message || 'Could not submit your request. Please try again.';
        },
      });
  }
}
