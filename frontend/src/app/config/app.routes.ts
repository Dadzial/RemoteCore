import { Routes } from '@angular/router';
import { loginGuard } from '../core/guards/login/login-guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [loginGuard],
    loadChildren: () =>
      import('../features/dashboard/dashboard-module').then(m => m.DashboardModule)
  }
];
