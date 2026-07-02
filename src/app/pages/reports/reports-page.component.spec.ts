import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { DashboardFacade } from '../../core/facades/dashboard.facade';
import { YearlyReport } from '../../core/models/dashboard.model';
import { MonthService } from '../../core/services/month.service';
import { ReportsPageComponent } from './reports-page.component';

describe('ReportsPageComponent', () => {
  let fixture: ComponentFixture<ReportsPageComponent>;
  let dashboardFacade: jasmine.SpyObj<DashboardFacade>;
  let monthService: { year: () => number; setMonthYear: jasmine.Spy };
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    dashboardFacade = jasmine.createSpyObj<DashboardFacade>('DashboardFacade', ['getYearlyReport']);
    dashboardFacade.getYearlyReport.and.returnValue(of(yearlyReport()));
    monthService = {
      year: () => 2026,
      setMonthYear: jasmine.createSpy('setMonthYear')
    };
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [ReportsPageComponent],
      providers: [
        { provide: DashboardFacade, useValue: dashboardFacade },
        { provide: MonthService, useValue: monthService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsPageComponent);
    fixture.detectChanges();
  });

  it('loads and renders the yearly report with empty months', () => {
    expect(dashboardFacade.getYearlyReport).toHaveBeenCalledWith(2026);
    expect(fixture.componentInstance.report().length).toBe(12);
    expect(fixture.nativeElement.textContent).toContain('R$1,000.00');
    expect(fixture.nativeElement.textContent).toContain('R$0.00');
  });

  it('updates the global month and navigates to dashboard when a month is selected', () => {
    fixture.componentInstance.openMonth(3);

    expect(monthService.setMonthYear).toHaveBeenCalledWith(3, 2026);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });
});

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
