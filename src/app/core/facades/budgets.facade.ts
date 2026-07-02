import { Injectable } from '@angular/core';
import { Subject, tap } from 'rxjs';
import { ApiService } from '../http/api.service';
import { BudgetUpsertRequest } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetsFacade {
  private readonly changedSubject = new Subject<void>();
  readonly changed$ = this.changedSubject.asObservable();

  constructor(private readonly api: ApiService) {}

  status(month: number, year: number) {
    return this.api.getBudgetStatus(month, year);
  }

  create(payload: BudgetUpsertRequest) {
    return this.api.createBudget(payload).pipe(tap(() => this.changedSubject.next()));
  }

  update(id: string, payload: BudgetUpsertRequest) {
    return this.api.updateBudget(id, payload).pipe(tap(() => this.changedSubject.next()));
  }

  delete(id: string) {
    return this.api.deleteBudget(id).pipe(tap(() => this.changedSubject.next()));
  }

  copyPrevious(month: number, year: number) {
    return this.api.copyPreviousBudgets(month, year).pipe(tap(() => this.changedSubject.next()));
  }
}
