import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiItem } from '../../../core/models/dashboard.model';

@Component({
  selector: 'ui-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="kpi-card">
      <span class="kpi-label">{{ kpi.label }}</span>
      <strong class="kpi-value">{{ kpi.value }}</strong>
      <span class="kpi-trend" [class.up]="kpi.trend === 'up'" [class.down]="kpi.trend === 'down'">
        {{ kpi.trend === 'up' ? '? crescimento' : kpi.trend === 'down' ? '? redução' : '— estável' }}
      </span>
    </article>
  `,
  styles: [`
    .kpi-card {
      border: 1px solid var(--color-hairline);
      border-radius: var(--radius-xl);
      padding: 20px;
      background: #fff;
      display: grid;
      gap: 6px;
    }
    .kpi-label { font-size: 13px; color: var(--color-body); }
    .kpi-value { font-family: var(--font-mono); font-size: 20px; color: var(--color-ink); }
    .kpi-trend { font-size: 12px; color: var(--color-muted); }
    .kpi-trend.up { color: var(--color-semantic-up); }
    .kpi-trend.down { color: var(--color-semantic-down); }
  `]
})
export class UiKpiCardComponent {
  @Input({ required: true }) kpi!: KpiItem;
}