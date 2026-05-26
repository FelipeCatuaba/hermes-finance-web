import { Component, signal } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { DashboardFacade } from '../../core/facades/dashboard.facade';
import { UiKpiCardComponent } from '../../shared/ui/kpi-card/ui-kpi-card.component';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, NgFor, UiKpiCardComponent, UiCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent {
  readonly month = signal(new Date().getMonth() + 1);
  readonly year = signal(new Date().getFullYear());

  readonly health$ = this.dashboardFacade.getHealth();
  readonly snapshot$ = this.dashboardFacade.getDashboardSnapshot(this.month(), this.year());

  constructor(private readonly dashboardFacade: DashboardFacade) {}
}