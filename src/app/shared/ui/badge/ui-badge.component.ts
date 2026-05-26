import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: `<span class="ui-badge"><ng-content /></span>`,
  styles: [`
    .ui-badge {
      display: inline-flex;
      align-items: center;
      border-radius: var(--radius-pill);
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      background: var(--color-surface-strong);
      color: var(--color-ink);
    }
  `]
})
export class UiBadgeComponent {
  @Input() variant: 'neutral' | 'primary' = 'neutral';
}