import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'cars/:id',
    loadComponent: () => import('./components/car-detail/car-detail.component').then((m) => m.CarDetailComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/user/user-dashboard/user-dashboard.component').then((m) => m.UserDashboardComponent),
  },
  {
    path: 'my-bookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/user/my-bookings/my-bookings.component').then((m) => m.MyBookingsComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/admin/admin-dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'admin/cars',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/admin/manage-cars/manage-cars.component').then((m) => m.ManageCarsComponent),
  },
  {
    path: 'admin/bookings',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/admin/manage-bookings/manage-bookings.component').then((m) => m.ManageBookingsComponent),
  },
  { path: '**', redirectTo: '' },
];
