import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HealthStatus } from '../models/dashboard.model';
import { FamilyMember, FamilyMemberUpsertRequest } from '../models/family-member.model';
import { ExpenseCategory, ExpenseCategoryUpsertRequest } from '../models/expense-category.model';
import { Expense, ExpenseCreateRequest } from '../models/expense.model';
import { Income, IncomeUpsertRequest } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private readonly http: HttpClient) {}

  getHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.baseUrl}/api/health`);
  }

  getFamilyMembers(includeInactive = false): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(`${this.baseUrl}/api/family-members`, {
      params: { includeInactive }
    });
  }

  createFamilyMember(payload: FamilyMemberUpsertRequest): Observable<FamilyMember> {
    return this.http.post<FamilyMember>(`${this.baseUrl}/api/family-members`, payload);
  }

  updateFamilyMember(id: string, payload: FamilyMemberUpsertRequest): Observable<FamilyMember> {
    return this.http.put<FamilyMember>(`${this.baseUrl}/api/family-members/${id}`, payload);
  }

  deactivateFamilyMember(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/family-members/${id}`);
  }

  getCategories(includeInactive = false): Observable<ExpenseCategory[]> {
    return this.http.get<ExpenseCategory[]>(`${this.baseUrl}/api/categories`, {
      params: { includeInactive }
    });
  }

  createCategory(payload: ExpenseCategoryUpsertRequest): Observable<ExpenseCategory> {
    return this.http.post<ExpenseCategory>(`${this.baseUrl}/api/categories`, payload);
  }

  updateCategory(id: string, payload: ExpenseCategoryUpsertRequest): Observable<ExpenseCategory> {
    return this.http.put<ExpenseCategory>(`${this.baseUrl}/api/categories/${id}`, payload);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/categories/${id}`);
  }

  createExpense(payload: ExpenseCreateRequest): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/api/expenses`, payload);
  }

  getIncomes(month: number, year: number): Observable<Income[]> {
    return this.http.get<Income[]>(`${this.baseUrl}/api/incomes`, {
      params: { month, year }
    });
  }

  createIncome(payload: IncomeUpsertRequest): Observable<Income> {
    return this.http.post<Income>(`${this.baseUrl}/api/incomes`, payload);
  }

  updateIncome(id: string, payload: IncomeUpsertRequest): Observable<Income> {
    return this.http.put<Income>(`${this.baseUrl}/api/incomes/${id}`, payload);
  }

  deleteIncome(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/incomes/${id}`);
  }
}
