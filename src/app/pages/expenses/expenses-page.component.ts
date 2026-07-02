import { Component, OnInit, signal } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { ExpensesFacade } from '../../core/facades/expenses.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { ExpenseCategory } from '../../core/models/expense-category.model';
import { Expense, ExpenseCreateRequest } from '../../core/models/expense.model';
import { FamilyMember } from '../../core/models/family-member.model';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

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

@Component({
  selector: 'app-expenses-page',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, FormsModule, NgFor, NgIf, UiButtonComponent, UiCardComponent],
  templateUrl: './expenses-page.component.html',
  styleUrl: './expenses-page.component.css'
})
export class ExpensesPageComponent implements OnInit {
  readonly createdExpenses$ = this.expensesFacade.createdExpenses$;
  readonly categories = signal<ExpenseCategory[]>([]);
  readonly familyMembers = signal<FamilyMember[]>([]);
  readonly editingExpense = signal<Expense | null>(null);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly today = new Date().toISOString().slice(0, 10);
  readonly items = [
    { name: 'Aluguel', category: 'Moradia', amount: 'R$ 1.500,00' },
    { name: 'Supermercado', category: 'Alimentacao', amount: 'R$ 487,20' },
    { name: 'Combustivel', category: 'Transporte', amount: 'R$ 320,00' },
    { name: 'Farmacia', category: 'Saude', amount: 'R$ 189,90' }
  ];
  form: ExpenseEditForm = this.emptyForm();

  constructor(
    private readonly categoriesFacade: CategoriesFacade,
    private readonly expensesFacade: ExpensesFacade,
    private readonly familyMembersFacade: FamilyMembersFacade
  ) {}

  ngOnInit(): void {
    this.loadOptions();
  }

  openEdit(expense: Expense): void {
    this.editingExpense.set(expense);
    this.form = {
      description: expense.description,
      amount: this.formatAmount(expense.amount),
      expenseDate: expense.expenseDate,
      categoryId: expense.categoryId ?? '',
      familyMemberId: expense.familyMemberId ?? '',
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

  deleteExpense(expense: Expense): void {
    if (!window.confirm('Remover este gasto ou parcela?')) {
      return;
    }

    this.expensesFacade.delete(expense.id).subscribe({
      next: () => this.successMessage.set('Gasto removido.'),
      error: () => this.errorMessage.set('Nao foi possivel remover o gasto agora.')
    });
  }

  deleteInstallmentGroup(expense: Expense): void {
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

  private loadOptions(): void {
    this.categoriesFacade.list().pipe(catchError(() => of([]))).subscribe((categories) => this.categories.set(categories));
    this.familyMembersFacade.list().pipe(catchError(() => of([]))).subscribe((members) => this.familyMembers.set(members));
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
