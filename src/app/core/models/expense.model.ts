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

export interface ExpenseCategorySummary {
  id: string;
  name: string;
  icon: string | null;
  colorHex: string | null;
}

export interface ExpenseFamilyMemberSummary {
  id: string;
  name: string;
  relation: string | null;
}

export interface ExpenseListItem {
  id: string;
  description: string;
  amount: number;
  expenseDate: string;
  category: ExpenseCategorySummary | null;
  familyMember: ExpenseFamilyMemberSummary | null;
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

export interface ExpenseListResponse {
  items: ExpenseListItem[];
  totalAmount: number;
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ExpenseListParams {
  month: number;
  year: number;
  categoryId?: string | null;
  memberId?: string | null;
  page?: number;
  size?: number;
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

export interface ExpenseBulkCreateRequest {
  description: string | null;
  amount: number | null;
  expenseDate: string | null;
  categoryId?: string | null;
  familyMemberId?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  isFixed?: boolean;
}

export interface ExpenseBulkCreateResponse {
  createdCount: number;
  failedCount: number;
  created: Expense[];
  errors: ExpenseBulkItemError[];
}

export interface ExpenseBulkItemError {
  index: number;
  field: string;
  message: string;
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
