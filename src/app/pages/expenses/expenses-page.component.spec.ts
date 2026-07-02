import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { ExpensesPageComponent } from './expenses-page.component';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { ExpensesFacade } from '../../core/facades/expenses.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { Expense } from '../../core/models/expense.model';

describe('ExpensesPageComponent', () => {
  let fixture: ComponentFixture<ExpensesPageComponent>;
  let expensesFacade: jasmine.SpyObj<ExpensesFacade>;

  const expense: Expense = {
    id: 'expense-1',
    description: 'Mercado',
    amount: 120.5,
    expenseDate: '2026-03-10',
    categoryId: 'category-1',
    familyMemberId: 'member-1',
    installmentGroupId: 'group-1',
    installmentNumber: 2,
    totalInstallments: 12,
    paymentMethod: 'card',
    notes: 'nota',
    fixed: true,
    scope: 'family',
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z'
  };

  beforeEach(async () => {
    const createdExpenses$ = new BehaviorSubject<Expense[]>([expense]);
    expensesFacade = jasmine.createSpyObj<ExpensesFacade>('ExpensesFacade', ['update', 'delete', 'deleteInstallmentGroup'], {
      createdExpenses$: createdExpenses$.asObservable()
    });
    expensesFacade.update.and.returnValue(of({ ...expense, familyMemberId: null, scope: 'owner' }));
    expensesFacade.delete.and.returnValue(of(undefined));
    expensesFacade.deleteInstallmentGroup.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [ExpensesPageComponent],
      providers: [
        {
          provide: CategoriesFacade,
          useValue: {
            list: () => of([{ id: 'category-1', name: 'Mercado', icon: null, colorHex: null, isDefault: true, active: true, createdAt: '' }])
          }
        },
        {
          provide: FamilyMembersFacade,
          useValue: {
            list: () => of([{ id: 'member-1', name: 'Isa', relation: null, active: true, createdAt: '' }])
          }
        },
        { provide: ExpensesFacade, useValue: expensesFacade }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesPageComponent);
    fixture.detectChanges();
  });

  it('prefills edit modal and submits update payload', () => {
    const component = fixture.componentInstance;
    component.openEdit(expense);
    component.form.familyMemberId = '';
    component.form.amount = '130,75';

    component.submitEdit();

    expect(expensesFacade.update).toHaveBeenCalledWith('expense-1', {
      description: 'Mercado',
      amount: 130.75,
      expenseDate: '2026-03-10',
      categoryId: 'category-1',
      familyMemberId: null,
      paymentMethod: 'card',
      notes: 'nota',
      isFixed: true
    });
  });

  it('deletes a single expense after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    fixture.componentInstance.deleteExpense(expense);

    expect(window.confirm).toHaveBeenCalledWith('Remover este gasto ou parcela?');
    expect(expensesFacade.delete).toHaveBeenCalledWith('expense-1');
  });

  it('deletes an installment group after clear confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    fixture.componentInstance.deleteInstallmentGroup(expense);

    expect(window.confirm).toHaveBeenCalledWith('Remover todas as parcelas deste parcelamento?');
    expect(expensesFacade.deleteInstallmentGroup).toHaveBeenCalledWith('group-1');
  });
});
