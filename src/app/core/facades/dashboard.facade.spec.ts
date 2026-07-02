import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardFacade } from './dashboard.facade';
import { ApiService } from '../http/api.service';
import { MonthlyReport } from '../models/dashboard.model';

describe('DashboardFacade', () => {
  it('returns fallback health when API fails', (done) => {
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        {
          provide: ApiService,
          useValue: {
            getHealth: () => throwError(() => new Error('offline')),
            getMonthlyReport: () => of(monthlyReport())
          }
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);

    facade.getHealth().subscribe((value) => {
      expect(value.status).toBe('offline');
      done();
    });
  });

  it('delegates monthly report loading to the API', (done) => {
    const api = jasmine.createSpyObj<ApiService>('ApiService', ['getHealth', 'getMonthlyReport']);
    api.getMonthlyReport.and.returnValue(of(monthlyReport()));
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: ApiService, useValue: api }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);

    facade.getMonthlyReport(5, 2026).subscribe((report) => {
      expect(api.getMonthlyReport).toHaveBeenCalledWith(5, 2026);
      expect(report.summary.savingsRate).toBe(75);
      done();
    });
  });
});

function monthlyReport(): MonthlyReport {
  return {
    income: {
      total: 1000,
      items: [
        {
          id: 'income-1',
          description: 'Salario',
          amount: 1000,
          incomeDate: '2026-05-01',
          category: null,
          recurring: true
        }
      ]
    },
    ownerExpenses: {
      total: 250,
      byCategory: [
        {
          category: { id: 'category-1', name: 'Mercado', icon: null, colorHex: null },
          total: 250,
          pctOfIncome: 25
        }
      ]
    },
    familyExpenses: { total: 0, byMember: [] },
    summary: {
      totalExpenses: 250,
      ownerBalance: 750,
      savingsRate: 75
    }
  };
}
