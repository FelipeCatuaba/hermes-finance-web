import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { ExpensesPageComponent } from './expenses-page.component';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { ExpensesFacade } from '../../core/facades/expenses.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { ExpenseListItem, ExpenseListResponse } from '../../core/models/expense.model';
import { MonthService } from '../../core/services/month.service';
import { BudgetsFacade } from '../../core/facades/budgets.facade';

describe('ExpensesPageComponent', () => {
  let fixture: ComponentFixture<ExpensesPageComponent>;
  let expensesFacade: jasmine.SpyObj<ExpensesFacade>;
  let budgetsFacade: jasmine.SpyObj<BudgetsFacade>;
  let refresh$: Subject<void>;
  let budgetChanged$: Subject<void>;

  const expense: ExpenseListItem = {
    id: 'expense-1',
    description: 'Mercado',
    amount: 120.5,
    expenseDate: '2026-03-10',
    category: { id: 'category-1', name: 'Mercado', icon: 'cart', colorHex: '#5b82ff' },
    familyMember: { id: 'member-1', name: 'Isa', relation: null },
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

  const listResponse: ExpenseListResponse = {
    items: [expense],
    totalAmount: 120.5,
    total: 1,
    page: 0,
    size: 20,
    totalPages: 1
  };

  beforeEach(async () => {
    refresh$ = new Subject<void>();
    budgetChanged$ = new Subject<void>();
    expensesFacade = jasmine.createSpyObj<ExpensesFacade>('ExpensesFacade', ['list', 'update', 'delete', 'deleteInstallmentGroup'], {
      refresh$: refresh$.asObservable()
    });
    expensesFacade.list.and.returnValue(of(listResponse));
    expensesFacade.update.and.returnValue(of({
      id: 'expense-1',
      description: 'Mercado',
      amount: 120.5,
      expenseDate: '2026-03-10',
      categoryId: null,
      familyMemberId: null,
      installmentGroupId: 'group-1',
      installmentNumber: 2,
      totalInstallments: 12,
      paymentMethod: 'card',
      notes: 'nota',
      fixed: true,
      scope: 'owner',
      createdAt: '2026-03-10T00:00:00Z',
      updatedAt: '2026-03-10T00:00:00Z'
    }));
    expensesFacade.delete.and.returnValue(of(undefined));
    expensesFacade.deleteInstallmentGroup.and.returnValue(of(undefined));
    budgetsFacade = jasmine.createSpyObj<BudgetsFacade>('BudgetsFacade', ['status'], {
      changed$: budgetChanged$.asObservable()
    });
    budgetsFacade.status.and.returnValue(of({
      month: 3,
      year: 2026,
      items: [
        {
          category: { id: 'category-1', name: 'Mercado', icon: 'cart', colorHex: '#5b82ff' },
          budgetId: 'budget-1',
          amountLimit: 200,
          spentAmount: 120.5,
          pctUsed: 60.25,
          overBudget: false
        }
      ]
    }));

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
        { provide: ExpensesFacade, useValue: expensesFacade },
        { provide: BudgetsFacade, useValue: budgetsFacade },
        {
          provide: MonthService,
          useValue: {
            period: () => ({ month: 3, year: 2026 }),
            period$: of({ month: 3, year: 2026 }),
            label: () => 'Marco de 2026'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesPageComponent);
    fixture.detectChanges();
  });

  it('loads expenses for the selected month', () => {
    expect(expensesFacade.list).toHaveBeenCalledWith({
      month: 3,
      year: 2026,
      categoryId: null,
      memberId: null,
      page: 0,
      size: 20
    });
    expect(fixture.componentInstance.expenses()).toEqual([expense]);
    expect(fixture.componentInstance.totalAmount()).toBe(120.5);
    expect(budgetsFacade.status).toHaveBeenCalledWith(3, 2026);
  });

  it('applies combined filters to the same month', () => {
    const component = fixture.componentInstance;
    component.selectedCategoryId = 'category-1';
    component.selectedMemberId = 'member-1';

    component.applyFilters();

    expect(expensesFacade.list).toHaveBeenCalledWith({
      month: 3,
      year: 2026,
      categoryId: 'category-1',
      memberId: 'member-1',
      page: 0,
      size: 20
    });
  });

  it('refreshes budget indicators when expenses refresh', () => {
    budgetsFacade.status.calls.reset();

    refresh$.next();

    expect(expensesFacade.list).toHaveBeenCalledTimes(2);
    expect(budgetsFacade.status).toHaveBeenCalledWith(3, 2026);
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
