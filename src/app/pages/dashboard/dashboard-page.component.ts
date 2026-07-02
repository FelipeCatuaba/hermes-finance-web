import { Component } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { catchError, forkJoin, map, merge, of, startWith, switchMap } from 'rxjs';
import { DashboardFacade } from '../../core/facades/dashboard.facade';
import { ExpensesFacade } from '../../core/facades/expenses.facade';
import { IncomesFacade } from '../../core/facades/incomes.facade';
import { MonthlyReport } from '../../core/models/dashboard.model';
import { MonthService } from '../../core/services/month.service';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';
import { BudgetsFacade } from '../../core/facades/budgets.facade';
import { BudgetStatusItem } from '../../core/models/budget.model';
import { budgetPercentLabel, budgetProgressWidth, budgetUsageTone } from '../../core/utils/budget-indicator.util';

interface DashboardState {
  report: MonthlyReport | null;
  budgetItems: BudgetStatusItem[];
  budgetByCategory: Record<string, BudgetStatusItem>;
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
    switchMap(({ month, year }) => merge(this.incomesFacade.changed$, this.expensesFacade.refresh$, this.budgetsFacade.changed$).pipe(
      startWith(undefined),
      switchMap(() => forkJoin({
        report: this.dashboardFacade.getMonthlyReport(month, year),
        budgets: this.budgetsFacade.status(month, year)
      }).pipe(
        map(({ report, budgets }) => ({
          report,
          budgetItems: budgets.items,
          budgetByCategory: this.indexBudgets(budgets.items),
          error: ''
        } satisfies DashboardState)),
        catchError(() => of({
          report: null,
          budgetItems: [],
          budgetByCategory: {},
          error: 'Nao foi possivel carregar o dashboard agora.'
        } satisfies DashboardState))
      ))
    ))
  );

  constructor(
    private readonly dashboardFacade: DashboardFacade,
    private readonly incomesFacade: IncomesFacade,
    private readonly expensesFacade: ExpensesFacade,
    private readonly budgetsFacade: BudgetsFacade,
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

  budgetForCategory(state: DashboardState, categoryId: string | null | undefined): BudgetStatusItem | null {
    return categoryId ? state.budgetByCategory[categoryId] ?? null : null;
  }

  budgetUsageClass(item: BudgetStatusItem): string {
    return budgetUsageTone(item.pctUsed);
  }

  budgetProgressWidth(item: BudgetStatusItem): string {
    return budgetProgressWidth(item.pctUsed);
  }

  budgetPercentLabel(item: BudgetStatusItem): string {
    return budgetPercentLabel(item.pctUsed);
  }

  visibleBudgetItems(items: BudgetStatusItem[]): BudgetStatusItem[] {
    return items.filter((item) => item.amountLimit !== null || item.spentAmount > 0);
  }

  private indexBudgets(items: BudgetStatusItem[]): Record<string, BudgetStatusItem> {
    return items.reduce<Record<string, BudgetStatusItem>>((indexed, item) => {
      indexed[item.category.id] = item;
      return indexed;
    }, {});
  }
}
