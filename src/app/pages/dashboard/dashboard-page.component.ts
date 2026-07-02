import { Component } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { DashboardFacade } from '../../core/facades/dashboard.facade';
import { ExpensesFacade } from '../../core/facades/expenses.facade';
import { IncomesFacade } from '../../core/facades/incomes.facade';
import { MonthlyReport } from '../../core/models/dashboard.model';
import { MonthService } from '../../core/services/month.service';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

interface DashboardState {
  report: MonthlyReport | null;
  error: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, NgFor, NgIf, UiCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent {
  readonly state$ = this.monthService.period$.pipe(
    switchMap(({ month, year }) => merge(this.incomesFacade.changed$, this.expensesFacade.refresh$).pipe(
      startWith(undefined),
      switchMap(() => this.dashboardFacade.getMonthlyReport(month, year).pipe(
        map((report) => ({ report, error: '' } satisfies DashboardState)),
        catchError(() => of({ report: null, error: 'Nao foi possivel carregar o dashboard agora.' } satisfies DashboardState))
      ))
    ))
  );

  constructor(
    private readonly dashboardFacade: DashboardFacade,
    private readonly incomesFacade: IncomesFacade,
    private readonly expensesFacade: ExpensesFacade,
    readonly monthService: MonthService
  ) {}

  percentLabel(value: number | null): string {
    return value === null ? '--' : `${Number(value).toFixed(2)}%`;
  }

  categoryName(item: MonthlyReport['ownerExpenses']['byCategory'][number]): string {
    return item.category?.name ?? 'Sem categoria';
  }

  memberName(item: MonthlyReport['familyExpenses']['byMember'][number]): string {
    return item.familyMember?.name ?? 'Familia';
  }
}
