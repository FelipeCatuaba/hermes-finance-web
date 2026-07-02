import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ImportPageComponent } from './import-page.component';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { ExpensesFacade } from '../../core/facades/expenses.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';

describe('ImportPageComponent', () => {
  let fixture: ComponentFixture<ImportPageComponent>;
  let expensesFacade: jasmine.SpyObj<ExpensesFacade>;

  beforeEach(async () => {
    expensesFacade = jasmine.createSpyObj<ExpensesFacade>('ExpensesFacade', ['bulkCreate']);
    expensesFacade.bulkCreate.and.returnValue(of({
      createdCount: 1,
      failedCount: 0,
      created: [],
      errors: []
    }));

    await TestBed.configureTestingModule({
      imports: [ImportPageComponent],
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

    fixture = TestBed.createComponent(ImportPageComponent);
    fixture.detectChanges();
  });

  it('submits non-empty rows as bulk expense payload', () => {
    const component = fixture.componentInstance;
    component.rows[0] = {
      ...component.rows[0],
      description: 'Mercado',
      amount: '120,50',
      expenseDate: '2026-03-10',
      categoryId: 'category-1',
      familyMemberId: 'member-1'
    };

    component.submit();

    expect(expensesFacade.bulkCreate).toHaveBeenCalledWith([
      {
        description: 'Mercado',
        amount: 120.5,
        expenseDate: '2026-03-10',
        categoryId: 'category-1',
        familyMemberId: 'member-1'
      }
    ]);
  });

  it('keeps failed rows and shows returned row errors', () => {
    expensesFacade.bulkCreate.and.returnValue(of({
      createdCount: 0,
      failedCount: 1,
      created: [],
      errors: [{ index: 0, field: 'amount', message: 'Valor deve ser maior que zero' }]
    }));
    const component = fixture.componentInstance;
    component.rows[0] = { ...component.rows[0], description: 'Mercado', amount: '0' };

    component.submit();
    fixture.detectChanges();

    expect(component.rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('amount: Valor deve ser maior que zero');
  });
});
