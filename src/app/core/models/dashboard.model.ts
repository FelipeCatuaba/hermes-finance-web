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
