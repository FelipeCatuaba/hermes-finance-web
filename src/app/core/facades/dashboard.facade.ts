import { Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { ApiService } from '../http/api.service';
import { DashboardSnapshot, HealthStatus } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  constructor(private readonly api: ApiService) {}

  getHealth() {
    return this.api.getHealth().pipe(
      catchError(() => of({ status: 'offline' } satisfies HealthStatus))
    );
  }

  getDashboardSnapshot(month: number, year: number) {
    return this.getHealth().pipe(
      map((health) => {
        const mockSnapshot: DashboardSnapshot = {
          month,
          year,
          kpis: [
            { label: 'Status API', value: health.status.toUpperCase(), trend: health.status === 'ok' ? 'up' : 'neutral' },
            { label: 'Saldo no mês', value: 'R$ 3.560,00', trend: 'up' },
            { label: 'Economia', value: '22%', trend: 'up' },
            { label: 'Despesas fixas', value: 'R$ 1.890,00', trend: 'down' }
          ],
          familyHighlights: ['2 membros ativos', '1 meta compartilhada', '0 alertas críticos'],
          expenseByCategory: [
            { name: 'Moradia', amount: 'R$ 1.100,00' },
            { name: 'Alimentação', amount: 'R$ 640,00' },
            { name: 'Transporte', amount: 'R$ 320,00' },
            { name: 'Lazer', amount: 'R$ 210,00' }
          ]
        };

        return mockSnapshot;
      })
    );
  }
}