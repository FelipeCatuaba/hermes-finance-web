export interface HealthStatus {
  status: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface DashboardSnapshot {
  month: number;
  year: number;
  kpis: KpiItem[];
  familyHighlights: string[];
  expenseByCategory: Array<{ name: string; amount: string }>;
}