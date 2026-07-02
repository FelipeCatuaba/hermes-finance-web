export type BudgetUsageTone = 'neutral' | 'ok' | 'warning' | 'danger';

export function budgetUsageTone(pctUsed: number | null): BudgetUsageTone {
  if (pctUsed === null) {
    return 'neutral';
  }
  if (pctUsed >= 100) {
    return 'danger';
  }
  if (pctUsed >= 70) {
    return 'warning';
  }
  return 'ok';
}

export function budgetProgressWidth(pctUsed: number | null): string {
  if (pctUsed === null || pctUsed <= 0) {
    return '0%';
  }
  return `${Math.min(pctUsed, 100)}%`;
}

export function budgetPercentLabel(pctUsed: number | null): string {
  return pctUsed === null ? 'Sem limite' : `${Number(pctUsed).toFixed(0)}%`;
}
