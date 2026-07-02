import { MonthlyCategorySummary } from './dashboard.model';

export interface Budget {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  amountLimit: number;
  createdAt: string;
}

export interface BudgetUpsertRequest {
  categoryId: string;
  month: number;
  year: number;
  amountLimit: number;
}

export interface BudgetStatusResponse {
  month: number;
  year: number;
  items: BudgetStatusItem[];
}

export interface BudgetStatusItem {
  category: MonthlyCategorySummary;
  budgetId: string | null;
  amountLimit: number | null;
  spentAmount: number;
  pctUsed: number | null;
  overBudget: boolean;
}
