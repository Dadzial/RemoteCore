import { Routes } from '@angular/router';
import { loginGuard } from '../guards/login/login-guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../pages/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [loginGuard],
    loadChildren: () =>
      import('../pages/dashboard/dashboard-module').then(m => m.DashboardModule)
  }
];
