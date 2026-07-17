import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarService } from '../../../core/services/car.service';
import { Car } from '../../../core/models';

@Component({
  selector: 'app-manage-cars',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './manage-cars.component.html',
})
export class ManageCarsComponent implements OnInit {
  private fb = inject(FormBuilder);

  cars: Car[] = [];
  loading = true;
  formOpen = false;
  editingId: string | null = null;
  errorMessage: string | null = null;

  // Images are managed separately from the typed form — supports both
  // pasted URLs and uploaded files, mixed together in one gallery list.
  images: string[] = [];
  newImageUrl = '';
  uploading = false;
  uploadError: string | null = null;

  form = this.fb.group({
    brand: ['', Validators.required],
    carName: ['', Validators.required],
    modelYear: [new Date().getFullYear(), Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    fuelType: ['Petrol', Validators.required],
    transmission: ['Manual', Validators.required],
    kmDriven: [0, [Validators.required, Validators.min(0)]],
    owners: [1, [Validators.required, Validators.min(1)]],
    description: [''],
    status: ['available', Validators.required],
  });

  readonly fuelTypes = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
  readonly transmissions = ['Manual', 'Automatic'];
  readonly statuses = ['available', 'reserved', 'sold'];

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.carService.getCars({ limit: 100 }).subscribe({
      next: (res) => {
        this.cars = res.data;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.images = [];
    this.newImageUrl = '';
    this.uploadError = null;
    this.form.reset({
      brand: '',
      carName: '',
      modelYear: new Date().getFullYear(),
      price: 0,
      fuelType: 'Petrol',
      transmission: 'Manual',
      kmDriven: 0,
      owners: 1,
      description: '',
      status: 'available',
    });
    this.formOpen = true;
  }

  openEdit(car: Car): void {
    this.editingId = car._id;
    this.images = [...(car.images || [])];
    this.newImageUrl = '';
    this.uploadError = null;
    this.form.patchValue(car);
    this.formOpen = true;
  }

  /** Dealer pastes an image link (e.g. a photo hosted elsewhere) */
  addImageUrl(): void {
    const url = this.newImageUrl.trim();
    if (!url) return;
    this.images.push(url);
    this.newImageUrl = '';
  }

  /** Dealer uploads photos directly from their computer/phone */
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (files.length === 0) return;

    this.uploading = true;
    this.uploadError = null;

    this.carService.uploadImages(files).subscribe({
      next: (res) => {
        this.images.push(...res.data);
        this.uploading = false;
        input.value = ''; // allow re-selecting the same file later
      },
      error: (err) => {
        this.uploadError = err.error?.message || 'Upload failed. Check file type (JPG/PNG/WEBP/GIF) and size (max 5MB).';
        this.uploading = false;
        input.value = '';
      },
    });
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }

  previewUrl(path: string): string {
    return this.carService.resolveImageUrl(path);
  }

  save(): void {
    if (this.form.invalid || this.images.length === 0) {
      this.form.markAllAsTouched();
      if (this.images.length === 0) {
        this.errorMessage = 'Add at least one photo before saving.';
      }
      return;
    }

    const payload = { ...(this.form.getRawValue() as Partial<Car>), images: this.images };
    const request$ = this.editingId
      ? this.carService.updateCar(this.editingId, payload)
      : this.carService.createCar(payload);

    request$.subscribe({
      next: () => {
        this.formOpen = false;
        this.fetch();
      },
      error: (err) => (this.errorMessage = err.error?.message || 'Failed to save listing'),
    });
  }

  remove(car: Car): void {
    if (!confirm(`Delete ${car.brand} ${car.carName}? This cannot be undone.`)) return;
    this.carService.deleteCar(car._id).subscribe(() => this.fetch());
  }

  thumbnail(car: Car): string {
    return this.carService.resolveImageUrl(car.images?.[0] || '');
  }
}
