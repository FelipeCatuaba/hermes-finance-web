import { Injectable } from '@angular/core';
import { ApiService } from '../http/api.service';
import { BudgetUpsertRequest } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetsFacade {
  constructor(private readonly api: ApiService) {}

  status(month: number, year: number) {
    return this.api.getBudgetStatus(month, year);
  }

  create(payload: BudgetUpsertRequest) {
    return this.api.createBudget(payload);
  }

  update(id: string, payload: BudgetUpsertRequest) {
    return this.api.updateBudget(id, payload);
  }

  delete(id: string) {
    return this.api.deleteBudget(id);
  }

  copyPrevious(month: number, year: number) {
    return this.api.copyPreviousBudgets(month, year);
  }
}
