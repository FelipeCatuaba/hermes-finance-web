import { Injectable } from '@angular/core';
import { Subject, tap } from 'rxjs';
import { ApiService } from '../http/api.service';
import { IncomeUpsertRequest } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class IncomesFacade {
  private readonly changedSubject = new Subject<void>();
  readonly changed$ = this.changedSubject.asObservable();

  constructor(private readonly api: ApiService) {}

  list(month: number, year: number) {
    return this.api.getIncomes(month, year);
  }

  create(payload: IncomeUpsertRequest) {
    return this.api.createIncome(payload).pipe(tap(() => this.changedSubject.next()));
  }

  update(id: string, payload: IncomeUpsertRequest) {
    return this.api.updateIncome(id, payload).pipe(tap(() => this.changedSubject.next()));
  }

  delete(id: string) {
    return this.api.deleteIncome(id).pipe(tap(() => this.changedSubject.next()));
  }
}
