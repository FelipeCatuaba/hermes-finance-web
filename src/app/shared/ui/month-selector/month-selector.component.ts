import { Component } from '@angular/core';
import { MonthService } from '../../../core/services/month.service';

@Component({
  selector: 'ui-month-selector',
  standalone: true,
  template: `
    <div class="month-selector" aria-label="Navegação mensal">
      <button type="button" class="nav-button" aria-label="Mês anterior" (click)="monthService.goToPrev()">‹</button>

      <label class="period-picker" for="month-selector-input">
        <span>{{ monthService.label() }}</span>
        <input
          id="month-selector-input"
          type="month"
          min="2000-01"
          [max]="monthService.maxInputValue()"
          [value]="monthService.inputValue()"
          aria-label="Selecionar mês e ano"
          (change)="onMonthChange($event)"
        />
      </label>

      <button
        type="button"
        class="nav-button"
        aria-label="Próximo mês"
        [disabled]="!monthService.canGoNext()"
        (click)="monthService.goToNext()"
      >›</button>
    </div>
  `,
  styles: [`
    .month-selector {
      font-size: 13px;
      color: var(--color-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-button,
    input {
      border-radius: var(--radius-pill);
      border: 1px solid var(--color-hairline);
      background: #fff;
    }

    .nav-button {
      width: 36px;
      height: 36px;
      display: inline-grid;
      place-items: center;
      color: var(--color-text);
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }

    .nav-button:disabled {
      cursor: not-allowed;
      opacity: .3;
      pointer-events: none;
    }

    .period-picker {
      display: grid;
      gap: 4px;
      min-width: 136px;
    }

    .period-picker span {
      color: var(--color-text);
      font-weight: 700;
      line-height: 1.2;
    }

    input {
      width: 100%;
      color: var(--color-muted);
      padding: 8px 10px;
    }
  `]
})
export class MonthSelectorComponent {
  constructor(readonly monthService: MonthService) {}

  onMonthChange(event: Event) {
    const [year, month] = (event.target as HTMLInputElement).value.split('-').map(Number);
    this.monthService.setMonthYear(month, year);
  }
}
