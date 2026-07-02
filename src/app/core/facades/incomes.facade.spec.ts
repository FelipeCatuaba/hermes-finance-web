import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IncomesFacade } from './incomes.facade';
import { ApiService } from '../http/api.service';

describe('IncomesFacade', () => {
  it('lists incomes by month and year', (done) => {
    const api = jasmine.createSpyObj<ApiService>('ApiService', ['getIncomes']);
    api.getIncomes.and.returnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        IncomesFacade,
        { provide: ApiService, useValue: api }
      ]
    });

    const facade = TestBed.inject(IncomesFacade);

    facade.list(3, 2026).subscribe(() => {
      expect(api.getIncomes).toHaveBeenCalledWith(3, 2026);
      done();
    });
  });

  it('emits changes after mutations', (done) => {
    const api = jasmine.createSpyObj<ApiService>('ApiService', ['createIncome']);
    api.createIncome.and.returnValue(of({
      id: 'income-1',
      description: 'Salario',
      amount: 8000,
      incomeDate: '2026-03-01',
      categoryId: null,
      recurring: true,
      notes: null,
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z'
    }));
    TestBed.configureTestingModule({
      providers: [
        IncomesFacade,
        { provide: ApiService, useValue: api }
      ]
    });

    const facade = TestBed.inject(IncomesFacade);
    facade.changed$.subscribe(() => {
      expect(api.createIncome).toHaveBeenCalled();
      done();
    });

    facade.create({
      description: 'Salario',
      amount: 8000,
      incomeDate: '2026-03-01',
      categoryId: null,
      isRecurring: true,
      notes: null
    }).subscribe();
  });
});
