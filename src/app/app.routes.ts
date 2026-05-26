import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { AuthPageComponent } from './pages/auth/auth-page.component';
import { authGuard } from './core/auth/auth.guard';
import { AppLayoutComponent } from './layouts/app-layout.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { SettingsPageComponent } from './pages/settings/settings-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { IncomePageComponent } from './pages/income/income-page.component';
import { ExpensesPageComponent } from './pages/expenses/expenses-page.component';
import { InstallmentsPageComponent } from './pages/installments/installments-page.component';
import { ReportsPageComponent } from './pages/reports/reports-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
  { path: 'auth', component: AuthPageComponent },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'income', component: IncomePageComponent },
      { path: 'expenses', component: ExpensesPageComponent },
      { path: 'installments', component: InstallmentsPageComponent },
      { path: 'reports', component: ReportsPageComponent },
      { path: 'settings', component: SettingsPageComponent }
    ]
  },
  { path: '**', component: NotFoundPageComponent }
];
