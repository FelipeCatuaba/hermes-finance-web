import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-sheet',
  standalone: true,
  imports: [NgIf],
  template: `
    <section class="sheet-backdrop" *ngIf="open" (click)="closed.emit()">
      <div
        class="sheet"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        (click)="$event.stopPropagation()"
      >
        <header>
          <div>
            <p *ngIf="kicker">{{ kicker }}</p>
            <h2 [id]="titleId">{{ title }}</h2>
          </div>
          <button type="button" class="icon-button" aria-label="Fechar" (click)="closed.emit()">x</button>
        </header>
        <ng-content />
      </div>
    </section>
  `,
  styles: [`
    .sheet-backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      display: grid;
      place-items: end center;
      padding: var(--space-base);
      background: color-mix(in srgb, var(--color-canvas) 72%, transparent);
    }

    .sheet {
      width: min(680px, 100%);
      max-height: min(760px, calc(100vh - 32px));
      overflow: auto;
      display: grid;
      gap: 14px;
      border: 1px solid var(--color-hairline);
      border-radius: var(--radius-lg);
      padding: 22px;
      background: var(--color-canvas);
      color: var(--color-ink);
      box-shadow: var(--shadow-soft);
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    header p {
      margin: 0;
      color: var(--color-muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      text-transform: uppercase;
    }

    h2 {
      margin: 0.2rem 0 0;
      font-family: var(--font-display);
      font-size: 1.8rem;
    }

    .icon-button {
      width: 36px;
      height: 36px;
      border: 1px solid var(--color-hairline-soft);
      border-radius: 50%;
      background: var(--color-surface-strong);
      color: var(--color-ink);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 800;
    }

    @media (max-width: 767px) {
      .sheet-backdrop {
        padding: 0;
        place-items: end stretch;
      }

      .sheet {
        width: 100%;
        max-height: calc(100vh - 16px);
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
      }
    }
  `]
})
export class UiSheetComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() kicker = '';
  @Output() closed = new EventEmitter<void>();

  readonly titleId = `sheet-title-${Math.random().toString(36).slice(2)}`;
}
