import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../pages/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../pages/dashboard/dashboard-module').then(m => m.DashboardModule)
  }
];
