import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { ApiService } from '../http/api.service';
import { Expense, ExpenseCreateRequest } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpensesFacade {
  private readonly createdExpensesSubject = new BehaviorSubject<Expense[]>([]);
  readonly createdExpenses$ = this.createdExpensesSubject.asObservable();

  constructor(private readonly api: ApiService) {}

  create(payload: ExpenseCreateRequest) {
    return this.api.createExpense(payload).pipe(
      tap((expense) => this.createdExpensesSubject.next([expense, ...this.createdExpensesSubject.value]))
    );
  }
}
