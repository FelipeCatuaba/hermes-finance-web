import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { publicAuthResetGuard } from './core/auth/public-auth-reset.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [publicAuthResetGuard],
    loadComponent: () => import('./pages/landing/landing-page.component').then((m) => m.LandingPageComponent)
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth-page.component').then((m) => m.AuthPageComponent)
  },
  {
    path: 'share/:token',
    loadComponent: () => import('./pages/public-share/public-share-page.component').then((m) => m.PublicSharePageComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/app-layout.component').then((m) => m.AppLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent)
      },
      {
        path: 'income',
        loadComponent: () => import('./pages/income/income-page.component').then((m) => m.IncomePageComponent)
      },
      {
        path: 'expenses',
        loadComponent: () => import('./pages/expenses/expenses-page.component').then((m) => m.ExpensesPageComponent)
      },
      {
        path: 'import',
        loadComponent: () => import('./pages/import/import-page.component').then((m) => m.ImportPageComponent)
      },
      {
        path: 'installments',
        loadComponent: () => import('./pages/installments/installments-page.component').then((m) => m.InstallmentsPageComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports-page.component').then((m) => m.ReportsPageComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings-page.component').then((m) => m.SettingsPageComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found-page.component').then((m) => m.NotFoundPageComponent)
  }
];
