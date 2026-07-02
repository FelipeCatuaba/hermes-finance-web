import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HealthStatus, MonthlyReport } from '../models/dashboard.model';
import { FamilyMember, FamilyMemberUpsertRequest } from '../models/family-member.model';
import { ExpenseCategory, ExpenseCategoryUpsertRequest } from '../models/expense-category.model';
import { Expense, ExpenseCreateRequest, ExpenseInstallmentCreateRequest, ExpenseListParams, ExpenseListResponse } from '../models/expense.model';
import { Income, IncomeUpsertRequest } from '../models/income.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl.replace(/\/$/, '');

  constructor(private readonly http: HttpClient) {}

  getHealth(): Observable<HealthStatus> {
    return this.http.get<HealthStatus>(`${this.baseUrl}/api/health`);
  }

  getMonthlyReport(month: number, year: number): Observable<MonthlyReport> {
    return this.http.get<MonthlyReport>(`${this.baseUrl}/api/reports/monthly`, {
      params: { month, year }
    });
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

  getExpenses(params: ExpenseListParams): Observable<ExpenseListResponse> {
    const requestParams: Record<string, string | number> = {
      month: params.month,
      year: params.year,
      page: params.page ?? 0,
      size: params.size ?? 20
    };

    if (params.categoryId) {
      requestParams['categoryId'] = params.categoryId;
    }
    if (params.memberId) {
      requestParams['memberId'] = params.memberId;
    }

    return this.http.get<ExpenseListResponse>(`${this.baseUrl}/api/expenses`, { params: requestParams });
  }

  createExpense(payload: ExpenseCreateRequest): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/api/expenses`, payload);
  }

  updateExpense(id: string, payload: ExpenseCreateRequest): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/api/expenses/${id}`, payload);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/expenses/${id}`);
  }

  createExpenseInstallments(payload: ExpenseInstallmentCreateRequest): Observable<Expense[]> {
    return this.http.post<Expense[]>(`${this.baseUrl}/api/expenses/installments`, payload);
  }

  deleteInstallmentGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/installment-groups/${id}`);
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
