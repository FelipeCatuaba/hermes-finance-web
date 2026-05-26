export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string | null;
  colorHex: string | null;
  isDefault: boolean;
  active: boolean;
  createdAt: string;
}

export interface ExpenseCategoryUpsertRequest {
  name: string;
  icon?: string | null;
  colorHex?: string | null;
}
