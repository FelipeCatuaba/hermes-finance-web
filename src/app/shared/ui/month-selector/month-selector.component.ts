import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'ui-month-selector',
  standalone: true,
  imports: [NgFor],
  template: `
    <label class="month-selector" for="month-selector-input">Mês
      <select id="month-selector-input" [value]="selectedMonth" (change)="onMonthChange($event)">
        <option *ngFor="let label of monthLabels; index as i" [value]="i + 1">{{ label }} / {{ year }}</option>
      </select>
    </label>
  `,
  styles: [`
    .month-selector {
      font-size: 13px;
      color: var(--color-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    select {
      border-radius: var(--radius-pill);
      border: 1px solid var(--color-hairline);
      padding: 10px 12px;
      background: #fff;
    }
  `]
})
export class MonthSelectorComponent {
  @Input() selectedMonth = new Date().getMonth() + 1;
  @Input() year = new Date().getFullYear();
  @Output() monthChange = new EventEmitter<number>();

  readonly monthLabels = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  onMonthChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    this.monthChange.emit(value);
  }
}