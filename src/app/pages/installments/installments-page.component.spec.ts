import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardFacade } from '../../core/facades/dashboard.facade';
import { OpenInstallmentsReport } from '../../core/models/dashboard.model';
import { InstallmentsPageComponent } from './installments-page.component';

describe('InstallmentsPageComponent', () => {
  let fixture: ComponentFixture<InstallmentsPageComponent>;
  let dashboardFacade: jasmine.SpyObj<DashboardFacade>;

  beforeEach(async () => {
    dashboardFacade = jasmine.createSpyObj<DashboardFacade>('DashboardFacade', ['getOpenInstallmentsReport']);
    dashboardFacade.getOpenInstallmentsReport.and.returnValue(of(report()));

    await TestBed.configureTestingModule({
      imports: [InstallmentsPageComponent],
      providers: [
        { provide: DashboardFacade, useValue: dashboardFacade }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InstallmentsPageComponent);
    fixture.detectChanges();
  });

  it('loads open installments and displays the committed total', () => {
    expect(dashboardFacade.getOpenInstallmentsReport).toHaveBeenCalled();
    expect(fixture.componentInstance.groups().length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Notebook');
    expect(fixture.nativeElement.textContent).toContain('R$800.00');
  });

  it('expands a card to show its future schedule', () => {
    fixture.componentInstance.toggleGroup('group-1');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('5/12');
    expect(fixture.nativeElement.textContent).toContain('R$100.00');
  });

  it('shows an empty state after load failure', () => {
    dashboardFacade.getOpenInstallmentsReport.and.returnValue(throwError(() => new Error('offline')));

    const failedFixture = TestBed.createComponent(InstallmentsPageComponent);
    failedFixture.detectChanges();

    expect(failedFixture.nativeElement.textContent).toContain('Nao foi possivel carregar');
    expect(failedFixture.nativeElement.textContent).toContain('Nenhum parcelamento em aberto.');
  });
});

function report(): OpenInstallmentsReport {
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
          { id: 'installment-5', installmentNumber: 5, amount: 100, dueDate: '2026-07-10' },
          { id: 'installment-6', installmentNumber: 6, amount: 100, dueDate: '2026-08-10' }
        ]
      }
    ]
  };
}
