import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { IncomePageComponent } from './income-page.component';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { IncomesFacade } from '../../core/facades/incomes.facade';
import { MonthService } from '../../core/services/month.service';
import { Income } from '../../core/models/income.model';

describe('IncomePageComponent', () => {
  const period$ = new BehaviorSubject({ month: 3, year: 2026 });
  const changed$ = new Subject<void>();
  const income: Income = {
    id: 'income-1',
    description: 'Salario',
    amount: 8000,
    incomeDate: '2026-03-10',
    categoryId: null,
    recurring: true,
    notes: null,
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z'
  };
  let fixture: ComponentFixture<IncomePageComponent>;
  let incomesFacade: jasmine.SpyObj<IncomesFacade>;

  beforeEach(async () => {
    incomesFacade = jasmine.createSpyObj<IncomesFacade>('IncomesFacade', ['list', 'create', 'update', 'delete'], {
      changed$: changed$.asObservable()
    });
    incomesFacade.list.and.returnValue(of([income]));
    incomesFacade.create.and.returnValue(of(income));
    incomesFacade.update.and.returnValue(of(income));
    incomesFacade.delete.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [IncomePageComponent],
      providers: [
        {
          provide: CategoriesFacade,
          useValue: {
            list: () => of([])
          }
        },
        { provide: IncomesFacade, useValue: incomesFacade },
        {
          provide: MonthService,
          useValue: {
            label: signal('Marco de 2026'),
            period: signal({ month: 3, year: 2026 }),
            period$: period$.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IncomePageComponent);
    fixture.detectChanges();
  });

  it('loads incomes for the selected month', () => {
    expect(incomesFacade.list).toHaveBeenCalledWith(3, 2026);
    expect(fixture.componentInstance.incomes()).toEqual([income]);
    expect(fixture.componentInstance.total()).toBe(8000);
  });

  it('creates income without familyMemberId in payload', () => {
    const component = fixture.componentInstance;
    component.openCreate();
    component.form = {
      description: ' Freela ',
      amount: '1.250,50',
      incomeDate: '2026-03-12',
      categoryId: '',
      isRecurring: false,
      notes: ' cliente A '
    };

    component.submit();

    expect(incomesFacade.create).toHaveBeenCalledWith({
      description: 'Freela',
      amount: 1250.5,
      incomeDate: '2026-03-12',
      categoryId: null,
      isRecurring: false,
      notes: 'cliente A'
    });
    const payload = incomesFacade.create.calls.mostRecent().args[0] as unknown as Record<string, unknown>;
    expect(payload['familyMemberId']).toBeUndefined();
  });

  it('updates and removes an existing income', () => {
    const component = fixture.componentInstance;
    component.openEdit(income);
    component.form.amount = '8.500,00';
    component.submit();
    component.remove(income);

    expect(incomesFacade.update).toHaveBeenCalledWith('income-1', jasmine.objectContaining({ amount: 8500 }));
    expect(incomesFacade.delete).toHaveBeenCalledWith('income-1');
  });
});
