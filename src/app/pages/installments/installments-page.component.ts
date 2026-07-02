import { CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { DashboardFacade } from '../../core/facades/dashboard.facade';
import { OpenInstallmentGroup } from '../../core/models/dashboard.model';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

@Component({
  selector: 'app-installments-page',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, NgFor, NgIf, UiCardComponent],
  templateUrl: './installments-page.component.html',
  styleUrl: './installments-page.component.css'
})
export class InstallmentsPageComponent implements OnInit {
  readonly groups = signal<OpenInstallmentGroup[]>([]);
  readonly totalCommitted = signal(0);
  readonly isLoading = signal(false);
  readonly error = signal('');
  readonly expandedGroupId = signal<string | null>(null);

  constructor(private readonly dashboardFacade: DashboardFacade) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.error.set('');
    this.isLoading.set(true);

    this.dashboardFacade.getOpenInstallmentsReport().pipe(
      catchError(() => {
        this.error.set('Nao foi possivel carregar os parcelamentos agora.');
        return of({ totalCommitted: 0, groups: [] });
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe((report) => {
      this.totalCommitted.set(report.totalCommitted);
      this.groups.set(report.groups);
      if (this.expandedGroupId() && !report.groups.some((group) => group.id === this.expandedGroupId())) {
        this.expandedGroupId.set(null);
      }
    });
  }

  toggleGroup(groupId: string): void {
    this.expandedGroupId.set(this.expandedGroupId() === groupId ? null : groupId);
  }

  isExpanded(groupId: string): boolean {
    return this.expandedGroupId() === groupId;
  }

  progressLabel(group: OpenInstallmentGroup): string {
    return `${group.paidInstallments}/${group.totalInstallments}`;
  }

  progressWidth(group: OpenInstallmentGroup): string {
    if (group.totalInstallments <= 0) {
      return '0%';
    }

    return `${Math.min(100, Math.max(0, (group.paidInstallments / group.totalInstallments) * 100))}%`;
  }

  trackGroup(_: number, group: OpenInstallmentGroup): string {
    return group.id;
  }
}
