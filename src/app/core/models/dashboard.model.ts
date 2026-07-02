export interface HealthStatus {
  status: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface MonthlyReport {
  income: {
    total: number;
    items: MonthlyIncomeItem[];
  };
  ownerExpenses: {
    total: number;
    byCategory: MonthlyCategoryBreakdown[];
  };
  familyExpenses: {
    total: number;
    byMember: MonthlyMemberBreakdown[];
  };
  summary: {
    totalExpenses: number;
    ownerBalance: number;
    savingsRate: number | null;
  };
}

export interface YearlyReport {
  year: number;
  months: YearlyReportMonth[];
}

export interface YearlyReportMonth {
  month: number;
  incomeTotal: number;
  ownerExpensesTotal: number;
  familyExpensesTotal: number;
  savingsRate: number | null;
}

export interface OpenInstallmentsReport {
  totalCommitted: number;
  groups: OpenInstallmentGroup[];
}

export interface OpenInstallmentGroup {
  id: string;
  description: string;
  totalAmount: number;
  paidInstallments: number;
  totalInstallments: number;
  nextDueDate: string;
  futureTotal: number;
  futureInstallments: OpenInstallmentItem[];
}

export interface OpenInstallmentItem {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
}

export interface MonthlyIncomeItem {
  id: string;
  description: string;
  amount: number;
  incomeDate: string;
  category: MonthlyCategorySummary | null;
  recurring: boolean;
}

export interface MonthlyCategoryBreakdown {
  category: MonthlyCategorySummary | null;
  total: number;
  pctOfIncome: number | null;
}

export interface MonthlyMemberBreakdown {
  familyMember: MonthlyFamilyMemberSummary | null;
  total: number;
}

export interface MonthlyCategorySummary {
  id: string;
  name: string;
  icon: string | null;
  colorHex: string | null;
}

export interface MonthlyFamilyMemberSummary {
  id: string;
  name: string;
  relation: string | null;
}
