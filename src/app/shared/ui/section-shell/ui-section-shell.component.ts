import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-section-shell',
  standalone: true,
  template: `
    <section class="section-shell" [class.dark]="dark">
      <div class="section-container">
        <ng-content />
      </div>
    </section>
  `,
  styles: [`
    .section-shell {
      padding: var(--space-section) 0;
      background: var(--color-canvas);
    }
    .section-shell.dark {
      background: var(--color-surface-dark);
      color: var(--color-white);
    }
  `]
})
export class UiSectionShellComponent {
  @Input() dark = false;
}
