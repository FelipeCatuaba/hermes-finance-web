import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { ExpensesFacade } from '../../core/facades/expenses.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { ExpenseCategory } from '../../core/models/expense-category.model';
import { ExpenseCreateRequest, ExpenseListItem } from '../../core/models/expense.model';
import { FamilyMember } from '../../core/models/family-member.model';
import { MonthService } from '../../core/services/month.service';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';
import { BudgetsFacade } from '../../core/facades/budgets.facade';
import { BudgetStatusItem } from '../../core/models/budget.model';
import { budgetPercentLabel, budgetProgressWidth, budgetUsageTone } from '../../core/utils/budget-indicator.util';
import { ExpenseItemComponent } from '../../shared/ui/expense-item/expense-item.component';
import { ScopeToggleComponent } from '../../shared/ui/scope-toggle/scope-toggle.component';

interface ExpenseEditForm {
  description: string;
  amount: string;
  expenseDate: string;
  categoryId: string;
  familyMemberId: string;
  paymentMethod: string;
  notes: string;
  isFixed: boolean;
}

interface ExpenseGroup {
  date: string;
  items: ExpenseListItem[];
}

@Component({
  selector: 'app-expenses-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, NgFor, NgIf, UiButtonComponent, UiCardComponent, ExpenseItemComponent, ScopeToggleComponent],
  templateUrl: './expenses-page.component.html',
  styleUrl: './expenses-page.component.css'
})
export class ExpensesPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = signal<ExpenseCategory[]>([]);
  readonly familyMembers = signal<FamilyMember[]>([]);
  readonly expenses = signal<ExpenseListItem[]>([]);
  readonly budgetStatus = signal<BudgetStatusItem[]>([]);
  readonly expenseGroups = computed<ExpenseGroup[]>(() => this.groupByDate(this.expenses()));
  readonly budgetByCategory = computed(() => this.indexBudgets(this.budgetStatus()));
  readonly visibleBudgetStatus = computed(() => this.budgetStatus().filter((item) => item.amountLimit !== null || item.spentAmount > 0));
  readonly editingExpense = signal<ExpenseListItem | null>(null);
  readonly isSubmitting = signal(false);
  readonly isLoading = signal(false);
  readonly hasLoaded = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly totalAmount = signal(0);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly size = signal(20);
  readonly totalPages = signal(0);
  readonly today = new Date().toISOString().slice(0, 10);

  selectedCategoryId = '';
  selectedMemberId = '';
  form: ExpenseEditForm = this.emptyForm();

  constructor(
    private readonly categoriesFacade: CategoriesFacade,
    private readonly expensesFacade: ExpensesFacade,
    private readonly familyMembersFacade: FamilyMembersFacade,
    private readonly budgetsFacade: BudgetsFacade,
    readonly monthService: MonthService
  ) {}

  ngOnInit(): void {
    this.loadOptions();
    this.monthService.period$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadExpenses(0);
        this.loadBudgets();
      });
    this.expensesFacade.refresh$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadExpenses(this.page());
        this.loadBudgets();
      });
    this.budgetsFacade.changed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.loadBudgets());
  }

  applyFilters(): void {
    this.loadExpenses(0);
  }

  clearFilters(): void {
    this.selectedCategoryId = '';
    this.selectedMemberId = '';
    this.loadExpenses(0);
  }

  nextPage(): void {
    if (this.page() + 1 >= this.totalPages()) {
      return;
    }
    this.loadExpenses(this.page() + 1);
  }

  prevPage(): void {
    if (this.page() === 0) {
      return;
    }
    this.loadExpenses(this.page() - 1);
  }

  openEdit(expense: ExpenseListItem): void {
    this.editingExpense.set(expense);
    this.form = {
      description: expense.description,
      amount: this.formatAmount(expense.amount),
      expenseDate: expense.expenseDate,
      categoryId: expense.category?.id ?? '',
      familyMemberId: expense.familyMember?.id ?? '',
      paymentMethod: expense.paymentMethod ?? '',
      notes: expense.notes ?? '',
      isFixed: expense.fixed
    };
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  closeEdit(): void {
    this.editingExpense.set(null);
  }

  submitEdit(): void {
    const editing = this.editingExpense();
    const payload = this.toPayload();
    if (!editing || !payload) {
      this.errorMessage.set('Preencha descricao, valor e data para salvar.');
      return;
    }

    this.isSubmitting.set(true);
    this.expensesFacade.update(editing.id, payload).pipe(
      finalize(() => this.isSubmitting.set(false))
    ).subscribe({
      next: () => {
        this.successMessage.set('Gasto atualizado.');
        this.editingExpense.set(null);
      },
      error: () => this.errorMessage.set('Nao foi possivel atualizar o gasto agora.')
    });
  }

  deleteExpense(expense: ExpenseListItem): void {
    if (!window.confirm('Remover este gasto ou parcela?')) {
      return;
    }

    this.expensesFacade.delete(expense.id).subscribe({
      next: () => this.successMessage.set('Gasto removido.'),
      error: () => this.errorMessage.set('Nao foi possivel remover o gasto agora.')
    });
  }

  deleteInstallmentGroup(expense: ExpenseListItem): void {
    if (!expense.installmentGroupId) {
      return;
    }

    if (!window.confirm('Remover todas as parcelas deste parcelamento?')) {
      return;
    }

    this.expensesFacade.deleteInstallmentGroup(expense.installmentGroupId).subscribe({
      next: () => this.successMessage.set('Parcelamento removido.'),
      error: () => this.errorMessage.set('Nao foi possivel remover o parcelamento agora.')
    });
  }

  categoryLabel(expense: ExpenseListItem): string {
    return expense.category?.name ?? 'Sem categoria';
  }

  categoryIcon(expense: ExpenseListItem): string {
    return expense.category?.icon ?? '#';
  }

  memberLabel(expense: ExpenseListItem): string {
    return expense.familyMember?.name ?? 'Meu';
  }

  paymentLabel(expense: ExpenseListItem): string {
    return expense.paymentMethod || 'Sem forma';
  }

  budgetForExpense(expense: ExpenseListItem): BudgetStatusItem | null {
    return expense.category?.id ? this.budgetByCategory().get(expense.category.id) ?? null : null;
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

  private loadExpenses(page: number): void {
    const period = this.monthService.period();
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.expensesFacade.list({
      month: period.month,
      year: period.year,
      categoryId: this.selectedCategoryId || null,
      memberId: this.selectedMemberId || null,
      page,
      size: this.size()
    }).pipe(
      catchError(() => {
        this.errorMessage.set('Nao foi possivel carregar os gastos agora.');
        return of(null);
      }),
      finalize(() => {
        this.isLoading.set(false);
        this.hasLoaded.set(true);
      })
    ).subscribe((response) => {
      if (!response) {
        return;
      }
      this.expenses.set(response.items);
      this.totalAmount.set(response.totalAmount);
      this.total.set(response.total);
      this.page.set(response.page);
      this.size.set(response.size);
      this.totalPages.set(response.totalPages);
    });
  }

  private loadBudgets(): void {
    const period = this.monthService.period();
    this.budgetsFacade.status(period.month, period.year).pipe(
      catchError(() => of({ month: period.month, year: period.year, items: [] }))
    ).subscribe((response) => this.budgetStatus.set(response.items));
  }

  private loadOptions(): void {
    this.categoriesFacade.list().pipe(catchError(() => of([]))).subscribe((categories) => this.categories.set(categories));
    this.familyMembersFacade.list().pipe(catchError(() => of([]))).subscribe((members) => this.familyMembers.set(members));
  }

  private groupByDate(expenses: ExpenseListItem[]): ExpenseGroup[] {
    const groups = new Map<string, ExpenseListItem[]>();
    for (const expense of expenses) {
      const items = groups.get(expense.expenseDate) ?? [];
      items.push(expense);
      groups.set(expense.expenseDate, items);
    }
    return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
  }

  private indexBudgets(items: BudgetStatusItem[]): Map<string, BudgetStatusItem> {
    return new Map(items.map((item) => [item.category.id, item]));
  }

  private toPayload(): ExpenseCreateRequest | null {
    const amount = this.parseAmount(this.form.amount);
    if (!this.form.description.trim() || !Number.isFinite(amount) || amount <= 0 || !this.form.expenseDate) {
      return null;
    }

    return {
      description: this.form.description.trim(),
      amount,
      expenseDate: this.form.expenseDate,
      categoryId: this.form.categoryId || null,
      familyMemberId: this.form.familyMemberId || null,
      paymentMethod: this.trimToNull(this.form.paymentMethod),
      notes: this.trimToNull(this.form.notes),
      isFixed: this.form.isFixed
    };
  }

  private emptyForm(): ExpenseEditForm {
    return {
      description: '',
      amount: '',
      expenseDate: '',
      categoryId: '',
      familyMemberId: '',
      paymentMethod: '',
      notes: '',
      isFixed: false
    };
  }

  private parseAmount(value: string): number {
    return Number(value.replace(/\./g, '').replace(',', '.'));
  }

  private formatAmount(value: number): string {
    return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private trimToNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
}
