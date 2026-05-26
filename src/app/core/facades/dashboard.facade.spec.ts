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
            getHealth: () => throwError(() => new Error('offline'))
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
            getHealth: () => of({ status: 'ok' })
          }
        }
      ]
    });

    const facade = TestBed.inject(DashboardFacade);

    facade.getDashboardSnapshot(5, 2026).subscribe((snapshot) => {
      expect(snapshot.month).toBe(5);
      expect(snapshot.year).toBe(2026);
      expect(snapshot.kpis.length).toBeGreaterThan(0);
      done();
    });
  });
});