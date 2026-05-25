import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';
import { UiButtonComponent } from '../shared/ui/button/ui-button.component';
import { AuthSessionService } from '../core/auth/auth-session.service';
import { MonthSelectorComponent } from '../shared/ui/month-selector/month-selector.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UiButtonComponent, NgFor, MonthSelectorComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.css'
})
export class AppLayoutComponent {
  readonly month = signal(new Date().getMonth() + 1);
  readonly year = signal(new Date().getFullYear());

  constructor(private readonly auth: AuthSessionService) {}

  onMonthChange(month: number) {
    this.month.set(month);
  }

  async logout() {
    await this.auth.signOut();
    window.location.href = '/';
  }
}
