export interface Income {
  id: string;
  description: string;
  amount: number;
  incomeDate: string;
  categoryId: string | null;
  recurring: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeUpsertRequest {
  description: string;
  amount: number;
  incomeDate: string;
  categoryId?: string | null;
  isRecurring?: boolean;
  notes?: string | null;
}
