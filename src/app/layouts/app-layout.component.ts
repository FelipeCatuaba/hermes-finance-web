import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass, NgFor } from '@angular/common';
import { UiButtonComponent } from '../shared/ui/button/ui-button.component';
import { AuthSessionService } from '../core/auth/auth-session.service';
import { MonthSelectorComponent } from '../shared/ui/month-selector/month-selector.component';
import { MonthService } from '../core/services/month.service';
import { NewExpenseFabComponent } from '../shared/features/new-expense-fab/new-expense-fab.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UiButtonComponent, MonthSelectorComponent, NewExpenseFabComponent, NgClass, NgFor],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
  readonly mobileMenuOpen = signal(false);
  readonly navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { path: '/income', label: 'Receitas', icon: 'bi-arrow-down-circle' },
    { path: '/expenses', label: 'Gastos', icon: 'bi-arrow-up-circle' },
    { path: '/import', label: 'Importacao', icon: 'bi-upload' },
    { path: '/installments', label: 'Parcelamentos', icon: 'bi-calendar2-range' },
    { path: '/reports', label: 'Relatorio', icon: 'bi-bar-chart' },
    { path: '/settings', label: 'Config', icon: 'bi-gear' }
  ];
  readonly bottomNavItems = this.navItems.filter((item) => ['/dashboard', '/income', '/expenses', '/reports', '/settings'].includes(item.path));

  constructor(
    private readonly auth: AuthSessionService,
    private readonly monthService: MonthService
  ) {}

  toggleMobileMenu() {
    this.mobileMenuOpen.update((value) => !value);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  async logout() {
    this.monthService.resetToCurrent();
    await this.auth.signOut();
    window.location.href = '/';
  }
}

