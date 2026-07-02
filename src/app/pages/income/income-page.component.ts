import { Component, DestroyRef, OnInit, computed, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of, startWith, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { IncomesFacade } from '../../core/facades/incomes.facade';
import { ExpenseCategory } from '../../core/models/expense-category.model';
import { Income, IncomeUpsertRequest } from '../../core/models/income.model';
import { MonthService } from '../../core/services/month.service';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

interface IncomeFormState {
  description: string;
  amount: string;
  incomeDate: string;
  categoryId: string;
  isRecurring: boolean;
  notes: string;
}

@Component({
  selector: 'app-income-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, NgFor, NgIf, UiButtonComponent, UiCardComponent],
  templateUrl: './income-page.component.html',
  styleUrl: './income-page.component.css'
})
export class IncomePageComponent implements OnInit {
  readonly incomes = signal<Income[]>([]);
  readonly categories = signal<ExpenseCategory[]>([]);
  readonly isLoading = signal(false);
  readonly isSubmitting = signal(false);
  readonly isModalOpen = signal(false);
  readonly editingIncome = signal<Income | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly total = computed(() => this.incomes().reduce((sum, income) => sum + Number(income.amount), 0));
  readonly recurringTotal = computed(() => this.incomes()
    .filter((income) => income.recurring)
    .reduce((sum, income) => sum + Number(income.amount), 0));
  readonly oneTimeTotal = computed(() => this.total() - this.recurringTotal());
  readonly selectedMonthLabel = this.monthService.label;
  readonly today = new Date().toISOString().slice(0, 10);
  form: IncomeFormState = this.initialForm();

  constructor(
    private readonly categoriesFacade: CategoriesFacade,
    private readonly incomesFacade: IncomesFacade,
    private readonly monthService: MonthService,
    private readonly destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.monthService.period$.pipe(
      switchMap((period) => this.incomesFacade.changed$.pipe(
        startWith(undefined),
        switchMap(() => this.loadIncomes(period.month, period.year))
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((incomes) => this.incomes.set(incomes));
  }

  openCreate(): void {
    this.editingIncome.set(null);
    this.form = this.initialForm();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isModalOpen.set(true);
  }

  openEdit(income: Income): void {
    this.editingIncome.set(income);
    this.form = {
      description: income.description,
      amount: this.formatAmountForInput(income.amount),
      incomeDate: income.incomeDate,
      categoryId: income.categoryId ?? '',
      isRecurring: income.recurring,
      notes: income.notes ?? ''
    };
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = this.toPayload();
    if (!payload) {
      this.errorMessage.set('Preencha descricao, valor e data para salvar.');
      return;
    }

    this.isSubmitting.set(true);
    const editing = this.editingIncome();
    const request$ = editing
      ? this.incomesFacade.update(editing.id, payload)
      : this.incomesFacade.create(payload);

    request$.pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.successMessage.set(editing ? 'Receita atualizada.' : 'Receita criada.');
        this.isModalOpen.set(false);
      },
      error: () => this.errorMessage.set('Nao foi possivel salvar a receita agora.')
    });
  }

  remove(income: Income): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.incomesFacade.delete(income.id).subscribe({
      next: () => this.successMessage.set('Receita removida.'),
      error: () => this.errorMessage.set('Nao foi possivel remover a receita agora.')
    });
  }

  categoryName(categoryId: string | null): string {
    if (!categoryId) {
      return 'Sem categoria';
    }
    return this.categories().find((category) => category.id === categoryId)?.name ?? 'Categoria';
  }

  private loadCategories(): void {
    this.categoriesFacade.list().pipe(
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((categories) => this.categories.set(categories));
  }

  private loadIncomes(month: number, year: number) {
    this.isLoading.set(true);
    return this.incomesFacade.list(month, year).pipe(
      catchError(() => {
        this.errorMessage.set('Nao foi possivel carregar as receitas do mes.');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  private toPayload(): IncomeUpsertRequest | null {
    const amount = this.parseAmount(this.form.amount);
    if (!this.form.description.trim() || !Number.isFinite(amount) || amount <= 0 || !this.form.incomeDate) {
      return null;
    }

    return {
      description: this.form.description.trim(),
      amount,
      incomeDate: this.form.incomeDate,
      categoryId: this.form.categoryId || null,
      isRecurring: this.form.isRecurring,
      notes: this.trimToNull(this.form.notes)
    };
  }

  private initialForm(): IncomeFormState {
    const period = this.monthService.period();
    const current = new Date();
    const day = period.month === current.getMonth() + 1 && period.year === current.getFullYear() ? current.getDate() : 1;
    const date = new Date(period.year, period.month - 1, day).toISOString().slice(0, 10);

    return {
      description: '',
      amount: '',
      incomeDate: date,
      categoryId: '',
      isRecurring: false,
      notes: ''
    };
  }

  private parseAmount(value: string): number {
    const normalized = value.replace(/\./g, '').replace(',', '.');
    return Number(normalized);
  }

  private formatAmountForInput(amount: number): string {
    return Number(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private trimToNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
}
