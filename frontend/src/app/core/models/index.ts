export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
export type Transmission = 'Manual' | 'Automatic';
export type CarStatus = 'available' | 'reserved' | 'sold';

export interface Car {
  _id: string;
  brand: string;
  carName: string;
  modelYear: number;
  price: number;
  fuelType: FuelType;
  transmission: Transmission;
  kmDriven: number;
  owners: number;
  description: string;
  images: string[];
  status: CarStatus;
  createdAt?: string;
}

export interface CarQueryParams {
  search?: string;
  brand?: string;
  fuelType?: FuelType | '';
  transmission?: Transmission | '';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'modelYear' | 'kmDriven' | '';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CarListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Car[];
}

export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  _id: string;
  car: Pick<Car, '_id' | 'brand' | 'carName' | 'images' | 'price' | 'status'>;
  user?: Pick<User, '_id' | 'name' | 'email' | 'phone'>;
  visitDate: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
}
