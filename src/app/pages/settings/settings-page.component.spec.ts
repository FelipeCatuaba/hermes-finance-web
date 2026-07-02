import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SettingsPageComponent } from './settings-page.component';
import { SettingsFacade } from '../../core/facades/settings.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { BudgetsFacade } from '../../core/facades/budgets.facade';
import { MonthService } from '../../core/services/month.service';
import { BudgetStatusResponse } from '../../core/models/budget.model';

describe('SettingsPageComponent', () => {
  let fixture: ComponentFixture<SettingsPageComponent>;
  let component: SettingsPageComponent;
  let budgetsFacade: jasmine.SpyObj<BudgetsFacade>;

  beforeEach(async () => {
    budgetsFacade = jasmine.createSpyObj<BudgetsFacade>('BudgetsFacade', ['status', 'create', 'update', 'delete', 'copyPrevious']);
    budgetsFacade.status.and.returnValue(of(budgetStatus()));
    budgetsFacade.create.and.returnValue(of({
      id: 'budget-2',
      categoryId: 'category-2',
      month: 3,
      year: 2026,
      amountLimit: 250,
      createdAt: '2026-03-01T00:00:00Z'
    }));
    budgetsFacade.update.and.returnValue(of({
      id: 'budget-1',
      categoryId: 'category-1',
      month: 3,
      year: 2026,
      amountLimit: 650,
      createdAt: '2026-03-01T00:00:00Z'
    }));
    budgetsFacade.delete.and.returnValue(of(void 0));
    budgetsFacade.copyPrevious.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [
        {
          provide: SettingsFacade,
          useValue: {
            getSettingsSnapshot: () => of({
              familyMembers: [],
              categories: [],
              monthlyBudget: 'R$ 6.000,00',
              securityLabel: 'JWT'
            })
          }
        },
        { provide: FamilyMembersFacade, useValue: { list: () => of([]) } },
        { provide: CategoriesFacade, useValue: { list: () => of([]) } },
        { provide: BudgetsFacade, useValue: budgetsFacade },
        {
          provide: MonthService,
          useValue: {
            period: () => ({ month: 3, year: 2026 }),
            label: () => 'Março de 2026',
            period$: of({ month: 3, year: 2026 })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads budget status for the selected global month', () => {
    expect(budgetsFacade.status).toHaveBeenCalledWith(3, 2026);
    expect(fixture.nativeElement.textContent).toContain('Mercado');
    expect(component.budgetDrafts['category-1']).toBe('500');
  });

  it('updates an existing budget and refreshes status', () => {
    component.budgetDrafts['category-1'] = '650';

    component.saveBudget(component.budgetRows[0]);

    expect(budgetsFacade.update).toHaveBeenCalledWith('budget-1', {
      categoryId: 'category-1',
      month: 3,
      year: 2026,
      amountLimit: 650
    });
    expect(budgetsFacade.status).toHaveBeenCalledTimes(2);
  });

  it('creates a budget when the category has no configured limit', () => {
    component.budgetDrafts['category-2'] = '250';

    component.saveBudget(component.budgetRows[1]);

    expect(budgetsFacade.create).toHaveBeenCalledWith({
      categoryId: 'category-2',
      month: 3,
      year: 2026,
      amountLimit: 250
    });
    expect(budgetsFacade.status).toHaveBeenCalledTimes(2);
  });

  it('copies previous month budgets and refreshes status', () => {
    component.copyPreviousBudgets();

    expect(budgetsFacade.copyPrevious).toHaveBeenCalledWith(3, 2026);
    expect(budgetsFacade.status).toHaveBeenCalledTimes(2);
  });
});

function budgetStatus(): BudgetStatusResponse {
  return {
    month: 3,
    year: 2026,
    items: [
      {
        category: { id: 'category-1', name: 'Mercado', icon: 'cart', colorHex: '#22c55e' },
        budgetId: 'budget-1',
        amountLimit: 500,
        spentAmount: 350,
        pctUsed: 70,
        overBudget: false
      },
      {
        category: { id: 'category-2', name: 'Lazer', icon: 'party-popper', colorHex: '#f59e0b' },
        budgetId: null,
        amountLimit: null,
        spentAmount: 120,
        pctUsed: null,
        overBudget: false
      }
    ]
  };
}
