import { Component } from '@angular/core';
import { AsyncPipe, NgFor } from '@angular/common';
import { startWith, switchMap } from 'rxjs';
import { DashboardFacade } from '../../core/facades/dashboard.facade';
import { IncomesFacade } from '../../core/facades/incomes.facade';
import { MonthService } from '../../core/services/month.service';
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
  readonly health$ = this.dashboardFacade.getHealth();
  readonly snapshot$ = this.monthService.period$.pipe(
    switchMap(({ month, year }) => this.incomesFacade.changed$.pipe(
      startWith(undefined),
      switchMap(() => this.dashboardFacade.getDashboardSnapshot(month, year))
    ))
  );

  constructor(
    private readonly dashboardFacade: DashboardFacade,
    private readonly incomesFacade: IncomesFacade,
    private readonly monthService: MonthService
  ) {}
}
