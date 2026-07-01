import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { UiButtonComponent } from '../shared/ui/button/ui-button.component';
import { AuthSessionService } from '../core/auth/auth-session.service';
import { MonthSelectorComponent } from '../shared/ui/month-selector/month-selector.component';
import { MonthService } from '../core/services/month.service';
import { NewExpenseFabComponent } from '../shared/features/new-expense-fab/new-expense-fab.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UiButtonComponent, MonthSelectorComponent, NewExpenseFabComponent, NgClass],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
  readonly mobileMenuOpen = signal(false);

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

