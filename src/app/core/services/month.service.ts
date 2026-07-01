import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

export interface MonthPeriod {
  month: number;
  year: number;
}

@Injectable({ providedIn: 'root' })
export class MonthService {
  private readonly injector = inject(Injector);
  private readonly currentDate = () => new Date();
  private readonly selected = signal<MonthPeriod>(this.currentPeriod());

  readonly month = computed(() => this.selected().month);
  readonly year = computed(() => this.selected().year);
  readonly label = computed(() => this.formatLabel(this.selected()));
  readonly inputValue = computed(() => this.formatInputValue(this.selected()));
  readonly maxInputValue = computed(() => this.formatInputValue(this.currentPeriod()));
  readonly canGoNext = computed(() => !this.isCurrentOrFuture(this.selected()));
  readonly period = computed(() => this.selected());
  readonly period$ = toObservable(this.period, { injector: this.injector });

  goToPrev(): void {
    const { month, year } = this.selected();
    this.selected.set(month === 1 ? { month: 12, year: year - 1 } : { month: month - 1, year });
  }

  goToNext(): void {
    if (!this.canGoNext()) {
      return;
    }

    const { month, year } = this.selected();
    this.setMonthYear(month === 12 ? 1 : month + 1, month === 12 ? year + 1 : year);
  }

  setMonthYear(month: number, year: number): void {
    if (!this.isValidPeriod(month, year)) {
      return;
    }

    const next = { month, year };
    if (this.isFuture(next)) {
      return;
    }

    this.selected.set(next);
  }

  resetToCurrent(): void {
    this.selected.set(this.currentPeriod());
  }

  private currentPeriod(): MonthPeriod {
    const today = this.currentDate();
    return {
      month: today.getMonth() + 1,
      year: today.getFullYear()
    };
  }

  private isValidPeriod(month: number, year: number): boolean {
    return Number.isInteger(month) && month >= 1 && month <= 12 && Number.isInteger(year) && year >= 2000 && year <= 2100;
  }

  private isFuture(period: MonthPeriod): boolean {
    const current = this.currentPeriod();
    return period.year > current.year || (period.year === current.year && period.month > current.month);
  }

  private isCurrentOrFuture(period: MonthPeriod): boolean {
    const current = this.currentPeriod();
    return period.year > current.year || (period.year === current.year && period.month >= current.month);
  }

  private formatLabel(period: MonthPeriod): string {
    const date = new Date(period.year, period.month - 1, 1);
    const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  private formatInputValue(period: MonthPeriod): string {
    return `${period.year}-${String(period.month).padStart(2, '0')}`;
  }
}
