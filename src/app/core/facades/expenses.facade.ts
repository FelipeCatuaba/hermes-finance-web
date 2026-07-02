import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, tap } from 'rxjs';
import { ApiService } from '../http/api.service';
import { Expense, ExpenseCreateRequest, ExpenseInstallmentCreateRequest, ExpenseListParams } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpensesFacade {
  private readonly createdExpensesSubject = new BehaviorSubject<Expense[]>([]);
  private readonly refreshSubject = new Subject<void>();
  readonly createdExpenses$ = this.createdExpensesSubject.asObservable();
  readonly refresh$ = this.refreshSubject.asObservable();

  constructor(private readonly api: ApiService) {}

  list(params: ExpenseListParams) {
    return this.api.getExpenses(params);
  }

  create(payload: ExpenseCreateRequest) {
    return this.api.createExpense(payload).pipe(
      tap((expense) => {
        this.createdExpensesSubject.next([expense, ...this.createdExpensesSubject.value]);
        this.refreshSubject.next();
      })
    );
  }

  update(id: string, payload: ExpenseCreateRequest) {
    return this.api.updateExpense(id, payload).pipe(
      tap((updated) => {
        this.createdExpensesSubject.next(
          this.createdExpensesSubject.value.map((expense) => expense.id === id ? updated : expense)
        );
        this.refreshSubject.next();
      })
    );
  }

  delete(id: string) {
    return this.api.deleteExpense(id).pipe(
      tap(() => {
        this.createdExpensesSubject.next(
          this.createdExpensesSubject.value.filter((expense) => expense.id !== id)
        );
        this.refreshSubject.next();
      })
    );
  }

  createInstallments(payload: ExpenseInstallmentCreateRequest) {
    return this.api.createExpenseInstallments(payload).pipe(
      tap((expenses) => {
        this.createdExpensesSubject.next([...expenses, ...this.createdExpensesSubject.value]);
        this.refreshSubject.next();
      })
    );
  }

  deleteInstallmentGroup(id: string) {
    return this.api.deleteInstallmentGroup(id).pipe(
      tap(() => {
        this.createdExpensesSubject.next(
          this.createdExpensesSubject.value.filter((expense) => expense.installmentGroupId !== id)
        );
        this.refreshSubject.next();
      })
    );
  }
}
