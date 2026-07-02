import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardFacade } from './dashboard.facade';
import { ApiService } from '../http/api.service';
import { MonthlyReport, OpenInstallmentsReport, YearlyReport } from '../models/dashboard.model';

describe('DashboardFacade', () => {
  it('returns fallback health when API fails', (done) => {
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        {
          provide: ApiService,
          useValue: {
            getHealth: () => throwError(() => new Error('offline')),
            getMonthlyReport: () => of(monthlyReport()),
            getYearlyReport: () => of(yearlyReport()),
            getOpenInstallmentsReport: () => of(openInstallmentsReport())
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
    const api = jasmine.createSpyObj<ApiService>('ApiService', ['getHealth', 'getMonthlyReport', 'getYearlyReport', 'getOpenInstallmentsReport']);
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

  it('delegates yearly report loading to the API', (done) => {
    const api = jasmine.createSpyObj<ApiService>('ApiService', ['getHealth', 'getMonthlyReport', 'getYearlyReport', 'getOpenInstallmentsReport']);
    api.getYearlyReport.and.returnValue(of(yearlyReport()));
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: ApiService, useValue: api }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);

    facade.getYearlyReport(2026).subscribe((report) => {
      expect(api.getYearlyReport).toHaveBeenCalledWith(2026);
      expect(report.months.length).toBe(12);
      done();
    });
  });

  it('delegates open installments report loading to the API', (done) => {
    const api = jasmine.createSpyObj<ApiService>('ApiService', ['getHealth', 'getMonthlyReport', 'getYearlyReport', 'getOpenInstallmentsReport']);
    api.getOpenInstallmentsReport.and.returnValue(of(openInstallmentsReport()));
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: ApiService, useValue: api }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);

    facade.getOpenInstallmentsReport().subscribe((report) => {
      expect(api.getOpenInstallmentsReport).toHaveBeenCalled();
      expect(report.totalCommitted).toBe(800);
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

function yearlyReport(): YearlyReport {
  return {
    year: 2026,
    months: Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      incomeTotal: index === 0 ? 1000 : 0,
      ownerExpensesTotal: index === 0 ? 250 : 0,
      familyExpensesTotal: index === 0 ? 300 : 0,
      savingsRate: index === 0 ? 75 : null
    }))
  };
}

function openInstallmentsReport(): OpenInstallmentsReport {
  return {
    totalCommitted: 800,
    groups: [
      {
        id: 'group-1',
        description: 'Notebook',
        totalAmount: 1200,
        paidInstallments: 4,
        totalInstallments: 12,
        nextDueDate: '2026-07-10',
        futureTotal: 800,
        futureInstallments: [
          { id: 'installment-5', installmentNumber: 5, amount: 100, dueDate: '2026-07-10' }
        ]
      }
    ]
  };
}
