import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { NewExpenseFabComponent } from './new-expense-fab.component';
import { CategoriesFacade } from '../../../core/facades/categories.facade';
import { ExpensesFacade } from '../../../core/facades/expenses.facade';
import { FamilyMembersFacade } from '../../../core/facades/family-members.facade';
import { MonthService } from '../../../core/services/month.service';
import { Expense } from '../../../core/models/expense.model';

describe('NewExpenseFabComponent', () => {
  let fixture: ComponentFixture<NewExpenseFabComponent>;
  let expensesFacade: jasmine.SpyObj<ExpensesFacade>;

  const expense: Expense = {
    id: 'expense-1',
    description: 'Compra',
    amount: 100,
    expenseDate: '2026-01-15',
    categoryId: null,
    familyMemberId: null,
    installmentGroupId: null,
    installmentNumber: null,
    totalInstallments: null,
    paymentMethod: null,
    notes: null,
    fixed: false,
    scope: 'owner',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z'
  };

  beforeEach(async () => {
    expensesFacade = jasmine.createSpyObj<ExpensesFacade>('ExpensesFacade', ['create', 'createInstallments']);
    expensesFacade.create.and.returnValue(of(expense));
    expensesFacade.createInstallments.and.returnValue(of([
      { ...expense, installmentGroupId: 'group-1', installmentNumber: 1, totalInstallments: 2 },
      { ...expense, id: 'expense-2', expenseDate: '2026-02-15', installmentGroupId: 'group-1', installmentNumber: 2, totalInstallments: 2 }
    ]));

    await TestBed.configureTestingModule({
      imports: [NewExpenseFabComponent],
      providers: [
        { provide: CategoriesFacade, useValue: { list: () => of([]) } },
        { provide: FamilyMembersFacade, useValue: { list: () => of([]) } },
        { provide: ExpensesFacade, useValue: expensesFacade },
        {
          provide: MonthService,
          useValue: {
            period: signal({ month: 1, year: 2026 })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewExpenseFabComponent);
    fixture.detectChanges();
  });

  it('creates a single expense when installment mode is off', () => {
    const component = fixture.componentInstance;
    component.open();
    component.form = {
      description: ' Mercado ',
      amount: '120,50',
      expenseDate: '2026-01-10',
      categoryId: '',
      familyMemberId: '',
      paymentMethod: ' pix ',
      notes: ' nota ',
      isFixed: true,
      isInstallment: false,
      totalInstallments: 2
    };

    component.submit();

    expect(expensesFacade.create).toHaveBeenCalledWith({
      description: 'Mercado',
      amount: 120.5,
      expenseDate: '2026-01-10',
      categoryId: null,
      familyMemberId: null,
      paymentMethod: 'pix',
      notes: 'nota',
      isFixed: true
    });
    expect(expensesFacade.createInstallments).not.toHaveBeenCalled();
  });

  it('builds deterministic installment preview', () => {
    const component = fixture.componentInstance;
    component.form.isInstallment = true;
    component.form.amount = '100,00';
    component.form.totalInstallments = 3;
    component.form.expenseDate = '2026-01-15';

    const preview = component.installmentPreview();

    expect(preview.map((item) => item.amount)).toEqual([33.34, 33.33, 33.33]);
    expect(preview.map((item) => item.date)).toEqual(['2026-01-15', '2026-02-15', '2026-03-15']);
  });

  it('creates installment expenses with expected payload', () => {
    const component = fixture.componentInstance;
    component.form = {
      description: ' Notebook ',
      amount: '1.200,00',
      expenseDate: '2026-01-15',
      categoryId: 'category-1',
      familyMemberId: 'member-1',
      paymentMethod: ' credito ',
      notes: 'ignored',
      isFixed: false,
      isInstallment: true,
      totalInstallments: 12
    };

    component.submit();

    expect(expensesFacade.createInstallments).toHaveBeenCalledWith({
      description: 'Notebook',
      totalAmount: 1200,
      totalInstallments: 12,
      firstDueDate: '2026-01-15',
      categoryId: 'category-1',
      familyMemberId: 'member-1',
      paymentMethod: 'credito'
    });
    expect(expensesFacade.create).not.toHaveBeenCalled();
  });
});
