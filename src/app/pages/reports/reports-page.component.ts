import { CurrencyPipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { DashboardFacade } from '../../core/facades/dashboard.facade';
import { YearlyReportMonth } from '../../core/models/dashboard.model';
import { MonthService } from '../../core/services/month.service';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

interface YearlyTotals {
  income: number;
  ownerExpenses: number;
  familyExpenses: number;
  averageSavingsRate: number | null;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, FormsModule, NgFor, NgIf, UiCardComponent],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.css'
})
export class ReportsPageComponent implements OnInit {
  private readonly currentDate = new Date();
  readonly currentYear = this.currentDate.getFullYear();
  private readonly currentMonth = this.currentDate.getMonth() + 1;
  selectedYear = this.monthService.year();

  readonly report = signal<YearlyReportMonth[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  readonly maxAmount = computed(() => {
    const values = this.report().flatMap((month) => [
      month.incomeTotal,
      month.ownerExpensesTotal,
      month.familyExpensesTotal
    ]);
    return Math.max(1, ...values);
  });

  readonly totals = computed<YearlyTotals>(() => {
    const months = this.report();
    const savingsRates = months
      .map((month) => month.savingsRate)
      .filter((value): value is number => value !== null);

    return {
      income: months.reduce((sum, month) => sum + month.incomeTotal, 0),
      ownerExpenses: months.reduce((sum, month) => sum + month.ownerExpensesTotal, 0),
      familyExpenses: months.reduce((sum, month) => sum + month.familyExpensesTotal, 0),
      averageSavingsRate: savingsRates.length === 0
        ? null
        : savingsRates.reduce((sum, value) => sum + value, 0) / savingsRates.length
    };
  });

  constructor(
    private readonly dashboardFacade: DashboardFacade,
    private readonly monthService: MonthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadYear();
  }

  loadYear(): void {
    this.selectedYear = this.normalizeYear(this.selectedYear);
    this.error.set('');
    this.isLoading.set(true);

    this.dashboardFacade.getYearlyReport(this.selectedYear).pipe(
      catchError(() => {
        this.error.set('Nao foi possivel carregar o relatorio anual agora.');
        return of({ year: this.selectedYear, months: [] });
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe((report) => {
      this.report.set(report.months);
    });
  }

  changeYear(delta: number): void {
    const nextYear = this.selectedYear + delta;
    if (nextYear < 1900 || nextYear > this.currentYear) {
      return;
    }

    this.selectedYear = nextYear;
    this.loadYear();
  }

  openMonth(month: number): void {
    if (this.isFutureMonth(month)) {
      return;
    }

    this.monthService.setMonthYear(month, this.selectedYear);
    void this.router.navigateByUrl('/dashboard');
  }

  isFutureMonth(month: number): boolean {
    return this.selectedYear > this.currentYear || (this.selectedYear === this.currentYear && month > this.currentMonth);
  }

  monthLabel(month: number): string {
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' })
      .format(new Date(this.selectedYear, month - 1, 1))
      .replace('.', '');
  }

  barWidth(value: number): string {
    if (value <= 0) {
      return '0%';
    }

    return `${Math.max(4, (value / this.maxAmount()) * 100)}%`;
  }

  savingsPosition(value: number): string {
    const clamped = Math.min(100, Math.max(0, value));
    return `${clamped}%`;
  }

  percentLabel(value: number | null): string {
    return value === null ? '--' : `${value.toFixed(2)}%`;
  }

  trackMonth(_: number, month: YearlyReportMonth): number {
    return month.month;
  }

  private normalizeYear(year: number): number {
    const value = Number(year);
    if (!Number.isFinite(value)) {
      return this.currentYear;
    }

    return Math.min(this.currentYear, Math.max(1900, Math.trunc(value)));
  }
}
