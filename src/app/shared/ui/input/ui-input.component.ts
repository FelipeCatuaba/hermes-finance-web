import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <label class="ui-input__wrap">
      <span class="ui-input__label" *ngIf="label">{{ label }}</span>
      <input class="ui-input" [type]="type" [placeholder]="placeholder" [ngModel]="value" (ngModelChange)="valueChange.emit($event)" />
    </label>
  `,
  styles: [`
    .ui-input__wrap { display: grid; gap: 8px; }
    .ui-input__label { font-size: 14px; font-weight: 600; color: var(--color-body); }
    .ui-input {
      width: 100%;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-hairline);
      padding: 14px 16px;
      font: inherit;
      background: var(--color-surface-strong);
      color: var(--color-ink);
      transition: border-color 120ms ease;
    }
    .ui-input:focus-visible { border-color: var(--color-primary); }
  `]
})
export class UiInputComponent {
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
}
