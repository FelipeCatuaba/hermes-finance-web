import { TestBed } from '@angular/core/testing';
import { MonthService } from './month.service';

describe('MonthService', () => {
  let service: MonthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthService);
  });

  it('starts on the current month and year', () => {
    const today = new Date();

    expect(service.month()).toBe(today.getMonth() + 1);
    expect(service.year()).toBe(today.getFullYear());
  });

  it('moves to previous month across year boundary', () => {
    service.setMonthYear(1, 2026);

    service.goToPrev();

    expect(service.month()).toBe(12);
    expect(service.year()).toBe(2025);
  });

  it('moves to next month across year boundary', () => {
    service.setMonthYear(12, 2025);

    service.goToNext();

    expect(service.month()).toBe(1);
    expect(service.year()).toBe(2026);
  });

  it('disables next navigation on the current month', () => {
    service.resetToCurrent();

    expect(service.canGoNext()).toBeFalse();
  });

  it('does not set a future month', () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    service.setMonthYear(currentMonth, currentYear);
    service.setMonthYear(currentMonth === 12 ? 1 : currentMonth + 1, currentMonth === 12 ? currentYear + 1 : currentYear);

    expect(service.month()).toBe(currentMonth);
    expect(service.year()).toBe(currentYear);
  });

  it('resets to the current month', () => {
    service.setMonthYear(1, 2020);

    service.resetToCurrent();

    const today = new Date();
    expect(service.month()).toBe(today.getMonth() + 1);
    expect(service.year()).toBe(today.getFullYear());
  });
});
