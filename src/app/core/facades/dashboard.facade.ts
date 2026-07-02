import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ApiService } from '../http/api.service';
import { HealthStatus } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  constructor(private readonly api: ApiService) {}

  getHealth() {
    return this.api.getHealth().pipe(
      catchError(() => of({ status: 'offline' } satisfies HealthStatus))
    );
  }

  getMonthlyReport(month: number, year: number) {
    return this.api.getMonthlyReport(month, year);
  }
}
