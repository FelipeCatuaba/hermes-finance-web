import { budgetProgressWidth, budgetUsageTone } from './budget-indicator.util';

describe('budget indicator utilities', () => {
  it('classifies 69 percent as ok', () => {
    expect(budgetUsageTone(69)).toBe('ok');
  });

  it('classifies 70 percent as warning', () => {
    expect(budgetUsageTone(70)).toBe('warning');
  });

  it('classifies 99 percent as warning', () => {
    expect(budgetUsageTone(99)).toBe('warning');
  });

  it('classifies 100 percent as danger', () => {
    expect(budgetUsageTone(100)).toBe('danger');
  });

  it('does not render false progress for missing budgets', () => {
    expect(budgetUsageTone(null)).toBe('neutral');
    expect(budgetProgressWidth(null)).toBe('0%');
  });
});
