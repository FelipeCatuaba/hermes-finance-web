import { ExpenseCategorySummary } from './expense.model';

export interface ShareCreateRequest {
  familyMemberId: string;
  month: number;
  year: number;
  expiresInDays?: number;
}

export interface ShareToken {
  id: string;
  familyMemberId: string;
  familyMemberName: string;
  familyMemberRelation: string | null;
  month: number;
  year: number;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  shareUrl: string | null;
}

export interface PublicShareExpense {
  description: string;
  amount: number;
  expenseDate: string;
  category: ExpenseCategorySummary | null;
  paymentMethod: string | null;
  fixed: boolean;
}

export interface PublicShareStatement {
  familyMemberName: string;
  familyMemberRelation: string | null;
  month: number;
  year: number;
  total: number;
  expenses: PublicShareExpense[];
}
