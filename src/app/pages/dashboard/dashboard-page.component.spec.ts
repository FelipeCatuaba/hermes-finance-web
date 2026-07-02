import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardFacade } from '../../core/facades/dashboard.facade';
import { ExpensesFacade } from '../../core/facades/expenses.facade';
import { IncomesFacade } from '../../core/facades/incomes.facade';
import { MonthService } from '../../core/services/month.service';
import { BudgetsFacade } from '../../core/facades/budgets.facade';

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let dashboardFacade: jasmine.SpyObj<DashboardFacade>;
  let budgetsFacade: jasmine.SpyObj<BudgetsFacade>;

  beforeEach(async () => {
    dashboardFacade = jasmine.createSpyObj<DashboardFacade>('DashboardFacade', ['getMonthlyReport']);
    dashboardFacade.getMonthlyReport.and.returnValue(of({
      income: { total: 0, items: [] },
      ownerExpenses: {
        total: 250,
        byCategory: [
          {
            category: { id: 'category-1', name: 'Mercado', icon: null, colorHex: null },
            total: 250,
            pctOfIncome: null
          }
        ]
      },
      familyExpenses: { total: 0, byMember: [] },
      summary: {
        totalExpenses: 250,
        ownerBalance: -250,
        savingsRate: null
      }
    }));
    budgetsFacade = jasmine.createSpyObj<BudgetsFacade>('BudgetsFacade', ['status'], {
      changed$: new Subject<void>().asObservable()
    });
    budgetsFacade.status.and.returnValue(of({
      month: 3,
      year: 2026,
      items: [
        {
          category: { id: 'category-1', name: 'Mercado', icon: null, colorHex: null },
          budgetId: 'budget-1',
          amountLimit: 300,
          spentAmount: 250,
          pctUsed: 83.33,
          overBudget: false
        }
      ]
    }));

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        { provide: DashboardFacade, useValue: dashboardFacade },
        { provide: IncomesFacade, useValue: { changed$: new Subject<void>().asObservable() } },
        { provide: ExpensesFacade, useValue: { refresh$: new Subject<void>().asObservable() } },
        { provide: BudgetsFacade, useValue: budgetsFacade },
        {
          provide: MonthService,
          useValue: {
            period$: of({ month: 3, year: 2026 }),
            label: () => 'Marco de 2026'
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
  });

  it('loads the monthly report for the selected month', () => {
    expect(dashboardFacade.getMonthlyReport).toHaveBeenCalledWith(3, 2026);
    expect(budgetsFacade.status).toHaveBeenCalledWith(3, 2026);
  });

  it('renders safe placeholders for null percentages', () => {
    expect(fixture.nativeElement.textContent).toContain('-- economia');
    expect(fixture.nativeElement.textContent).not.toContain('Infinity');
    expect(fixture.nativeElement.textContent).not.toContain('NaN');
  });

  it('renders budget indicators for category spending', () => {
    expect(fixture.nativeElement.textContent).toContain('83%');
  });
});
