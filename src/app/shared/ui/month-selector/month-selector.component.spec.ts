import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthSelectorComponent } from './month-selector.component';
import { MonthService } from '../../../core/services/month.service';

describe('MonthSelectorComponent', () => {
  let fixture: ComponentFixture<MonthSelectorComponent>;
  let monthService: MonthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MonthSelectorComponent);
    monthService = TestBed.inject(MonthService);
    fixture.detectChanges();
  });

  it('moves to previous month when previous button is clicked', () => {
    monthService.setMonthYear(4, 2026);
    fixture.detectChanges();
    const previousButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-label="Mês anterior"]');

    previousButton.click();

    expect(monthService.month()).toBe(3);
    expect(monthService.year()).toBe(2026);
  });

  it('disables next button on current month', () => {
    monthService.resetToCurrent();
    fixture.detectChanges();
    const nextButton: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-label="Próximo mês"]');

    expect(nextButton.disabled).toBeTrue();
  });

  it('updates the selected period from month input', () => {
    spyOn(monthService, 'setMonthYear').and.callThrough();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="month"]');
    input.value = '2026-04';
    input.dispatchEvent(new Event('change'));

    expect(monthService.setMonthYear).toHaveBeenCalledWith(4, 2026);
  });
});
