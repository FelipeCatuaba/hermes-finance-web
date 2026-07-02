import { Injectable } from '@angular/core';
import { catchError, combineLatest, map, of } from 'rxjs';
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
    return combineLatest([
      this.getHealth(),
      this.api.getIncomes(month, year).pipe(catchError(() => of([])))
    ]).pipe(
      map(([health, incomes]) => {
        const incomeTotal = incomes.reduce((sum, income) => sum + Number(income.amount), 0);
        const expenseTotal = 2497.10;
        const balance = incomeTotal - expenseTotal;
        const savingsRate = incomeTotal > 0 ? Math.round((balance / incomeTotal) * 100) : 0;
        const mockSnapshot: DashboardSnapshot = {
          month,
          year,
          kpis: [
            { label: 'Status API', value: health.status.toUpperCase(), trend: health.status === 'ok' ? 'up' : 'neutral' },
            { label: 'Receitas', value: this.formatCurrency(incomeTotal), trend: incomeTotal > 0 ? 'up' : 'neutral' },
            { label: 'Saldo no mes', value: this.formatCurrency(balance), trend: balance >= 0 ? 'up' : 'down' },
            { label: 'Economia', value: `${savingsRate}%`, trend: savingsRate >= 0 ? 'up' : 'down' },
            { label: 'Despesas fixas', value: 'R$ 1.890,00', trend: 'down' }
          ],
          familyHighlights: ['2 membros ativos', '1 meta compartilhada', '0 alertas criticos'],
          expenseByCategory: [
            { name: 'Moradia', amount: 'R$ 1.100,00' },
            { name: 'Alimentacao', amount: 'R$ 640,00' },
            { name: 'Transporte', amount: 'R$ 320,00' },
            { name: 'Lazer', amount: 'R$ 210,00' }
          ]
        };

        return mockSnapshot;
      })
    );
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
}
