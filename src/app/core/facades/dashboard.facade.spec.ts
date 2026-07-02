import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardFacade } from './dashboard.facade';
import { ApiService } from '../http/api.service';

describe('DashboardFacade', () => {
  it('returns fallback health when API fails', (done) => {
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        {
          provide: ApiService,
          useValue: {
            getHealth: () => throwError(() => new Error('offline')),
            getIncomes: () => of([])
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

  it('builds dashboard snapshot from health', (done) => {
    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        {
          provide: ApiService,
          useValue: {
            getHealth: () => of({ status: 'ok' }),
            getIncomes: () => of([
              {
                id: 'income-1',
                description: 'Salario',
                amount: 8000,
                incomeDate: '2026-05-01',
                categoryId: null,
                recurring: true,
                notes: null,
                createdAt: '2026-05-01T00:00:00Z',
                updatedAt: '2026-05-01T00:00:00Z'
              }
            ])
          }
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);

    facade.getDashboardSnapshot(5, 2026).subscribe((snapshot) => {
      expect(snapshot.month).toBe(5);
      expect(snapshot.year).toBe(2026);
      expect(snapshot.kpis.length).toBeGreaterThan(0);
      expect(snapshot.kpis.some((kpi) => kpi.label === 'Receitas' && kpi.value.includes('8.000'))).toBeTrue();
      done();
    });
  });
});
