import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Car, CarListResponse, CarQueryParams } from '../models';

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly baseUrl = `${environment.apiUrl}/cars`;

  constructor(private http: HttpClient) {}

  getCars(params: CarQueryParams = {}): Observable<CarListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<CarListResponse>(this.baseUrl, { params: httpParams });
  }

  getBrands(): Observable<{ success: boolean; data: string[] }> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.baseUrl}/brands`);
  }

  getCarById(id: string): Observable<{ success: boolean; data: Car }> {
    return this.http.get<{ success: boolean; data: Car }>(`${this.baseUrl}/${id}`);
  }

  /** Uploads one or more image files, returns their server-hosted URLs (e.g. "/uploads/xyz.jpg") */
  uploadImages(files: File[]): Observable<{ success: boolean; data: string[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return this.http.post<{ success: boolean; data: string[] }>(`${this.baseUrl}/upload`, formData);
  }

  /** Resolves a stored image path (which may be relative, e.g. "/uploads/xyz.jpg") to a full URL */
  resolveImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const origin = environment.apiUrl.replace(/\/api$/, '');
    return `${origin}${path}`;
  }

  createCar(car: Partial<Car>): Observable<{ success: boolean; data: Car }> {
    return this.http.post<{ success: boolean; data: Car }>(this.baseUrl, car);
  }

  updateCar(id: string, car: Partial<Car>): Observable<{ success: boolean; data: Car }> {
    return this.http.put<{ success: boolean; data: Car }>(`${this.baseUrl}/${id}`, car);
  }

  deleteCar(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }
}
