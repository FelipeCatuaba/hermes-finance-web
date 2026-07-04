import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { SettingsPageComponent } from './settings-page.component';
import { SettingsFacade } from '../../core/facades/settings.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { BudgetsFacade } from '../../core/facades/budgets.facade';
import { MonthService } from '../../core/services/month.service';
import { BudgetStatusResponse } from '../../core/models/budget.model';
import { AuthSessionService } from '../../core/auth/auth-session.service';
import { ShareFacade } from '../../core/facades/share.facade';

describe('SettingsPageComponent', () => {
  let fixture: ComponentFixture<SettingsPageComponent>;
  let component: SettingsPageComponent;
  let budgetsFacade: jasmine.SpyObj<BudgetsFacade>;
  let shareFacade: jasmine.SpyObj<ShareFacade>;
  let auth: jasmine.SpyObj<AuthSessionService>;

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
    shareFacade = jasmine.createSpyObj<ShareFacade>('ShareFacade', ['list', 'create', 'revoke']);
    shareFacade.list.and.returnValue(of([]));
    shareFacade.create.and.returnValue(of({
      id: 'share-1',
      familyMemberId: 'member-1',
      familyMemberName: 'Isa',
      familyMemberRelation: 'Filha',
      month: 3,
      year: 2026,
      expiresAt: '2026-03-08T00:00:00Z',
      revokedAt: null,
      createdAt: '2026-03-01T00:00:00Z',
      shareUrl: 'https://app.hermes.local/share/raw-token'
    }));
    shareFacade.revoke.and.returnValue(of(void 0));
    auth = jasmine.createSpyObj<AuthSessionService>('AuthSessionService', ['refreshAccountSummary']);
    auth.refreshAccountSummary.and.resolveTo({
      userId: 'user-1',
      name: 'Felipe Catuaba',
      email: 'felipe@example.com',
      role: 'OWNER',
      passwordEnabled: true
    });

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
        { provide: ShareFacade, useValue: shareFacade },
        { provide: CategoriesFacade, useValue: { list: () => of([]) } },
        { provide: BudgetsFacade, useValue: budgetsFacade },
        { provide: AuthSessionService, useValue: auth },
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
    await fixture.whenStable();
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

  it('loads internal account summary in settings', () => {
    expect(auth.refreshAccountSummary).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('felipe@example.com');
    expect(fixture.nativeElement.textContent).toContain('OWNER');
  });

  it('creates share link for selected global month', () => {
    component.createShareLink({ id: 'member-1', name: 'Isa', relation: 'Filha', active: true, createdAt: '2026-01-01T00:00:00Z' });

    expect(shareFacade.create).toHaveBeenCalledWith({
      familyMemberId: 'member-1',
      month: 3,
      year: 2026,
      expiresInDays: 7
    });
    expect(component.generatedShareUrl).toBe('https://app.hermes.local/share/raw-token');
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
