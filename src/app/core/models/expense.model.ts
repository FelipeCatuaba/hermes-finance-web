export interface Expense {
  id: string;
  description: string;
  amount: number;
  expenseDate: string;
  categoryId: string | null;
  familyMemberId: string | null;
  installmentGroupId: string | null;
  installmentNumber: number | null;
  totalInstallments: number | null;
  paymentMethod: string | null;
  notes: string | null;
  fixed: boolean;
  scope: 'owner' | 'family';
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCreateRequest {
  description: string;
  amount: number;
  expenseDate: string;
  categoryId?: string | null;
  familyMemberId?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  isFixed?: boolean;
}

export interface ExpenseInstallmentCreateRequest {
  description: string;
  totalAmount: number;
  totalInstallments: number;
  firstDueDate: string;
  categoryId?: string | null;
  familyMemberId?: string | null;
  paymentMethod?: string | null;
}
