export interface ImportItemError {
  index: number;
  field: string;
  message: string;
}

export interface ImportBatchResponse {
  imported: number;
  failed: number;
  errors: ImportItemError[];
  monthsAffected: string[];
}

export interface ImportExpenseRequest {
  index: number;
  description: string;
  amount: number;
  expenseDate: string;
  categoryId?: string | null;
  familyMemberId?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  isFixed?: boolean;
  totalInstallments?: number | null;
  firstDueDate?: string | null;
}

export interface ImportIncomeRequest {
  index: number;
  description: string;
  amount: number;
  incomeDate: string;
  categoryId?: string | null;
  isRecurring?: boolean;
  notes?: string | null;
}
