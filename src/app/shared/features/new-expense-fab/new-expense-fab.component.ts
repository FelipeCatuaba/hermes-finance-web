import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { CategoriesFacade } from '../../../core/facades/categories.facade';
import { ExpensesFacade } from '../../../core/facades/expenses.facade';
import { FamilyMembersFacade } from '../../../core/facades/family-members.facade';
import { MonthService } from '../../../core/services/month.service';
import { ExpenseCategory } from '../../../core/models/expense-category.model';
import { FamilyMember } from '../../../core/models/family-member.model';
import { UiButtonComponent } from '../../ui/button/ui-button.component';
import { ScopeToggleComponent } from '../../ui/scope-toggle/scope-toggle.component';

interface ExpenseFormState {
  description: string;
  amount: string;
  expenseDate: string;
  categoryId: string;
  familyMemberId: string;
  paymentMethod: string;
  notes: string;
  isFixed: boolean;
  isInstallment: boolean;
  totalInstallments: number;
}

interface InstallmentPreviewItem {
  number: number;
  amount: number;
  date: string;
}

@Component({
  selector: 'app-new-expense-fab',
  standalone: true,
  imports: [CommonModule, FormsModule, UiButtonComponent, ScopeToggleComponent],
  template: `
    <button type="button" class="fab" aria-label="Novo lancamento" (click)="open()">+</button>

    <section class="sheet-backdrop" *ngIf="isOpen()" (click)="close()">
      <form class="sheet" role="dialog" aria-modal="true" aria-labelledby="new-expense-title" (click)="$event.stopPropagation()" (ngSubmit)="submit()">
        <header>
          <div>
            <p>Novo lancamento</p>
            <h2 id="new-expense-title">{{ form.isInstallment ? 'Compra parcelada' : 'Gasto avulso' }}</h2>
          </div>
          <button type="button" class="icon-button" aria-label="Fechar" (click)="close()">x</button>
        </header>

        <label>
          <span>Descricao</span>
          <input name="description" required maxlength="255" [(ngModel)]="form.description" />
        </label>

        <div class="field-grid">
          <label>
            <span>{{ form.isInstallment ? 'Valor total' : 'Valor' }}</span>
            <input name="amount" required inputmode="decimal" placeholder="0,00" [(ngModel)]="form.amount" />
          </label>

          <label>
            <span>{{ form.isInstallment ? 'Primeira parcela' : 'Data' }}</span>
            <input
              name="expenseDate"
              required
              type="date"
              [attr.max]="form.isInstallment ? null : today"
              [(ngModel)]="form.expenseDate"
            />
          </label>
        </div>

        <div class="field-grid">
          <label>
            <span>Categoria</span>
            <select name="categoryId" [(ngModel)]="form.categoryId">
              <option value="">Sem categoria</option>
              <option *ngFor="let category of categories()" [value]="category.id">{{ category.name }}</option>
            </select>
          </label>

          <ui-scope-toggle
            label="De quem e"
            [(familyMemberId)]="form.familyMemberId"
            [familyMembers]="familyMembers()"
          />
        </div>

        <label>
          <span>Forma de pagamento</span>
          <input name="paymentMethod" maxlength="50" placeholder="Pix, credito, debito..." [(ngModel)]="form.paymentMethod" />
        </label>

        <label>
          <span>Observacoes</span>
          <textarea name="notes" rows="3" [disabled]="form.isInstallment" [(ngModel)]="form.notes"></textarea>
        </label>

        <div class="toggle-row">
          <label class="toggle">
            <input name="isInstallment" type="checkbox" [(ngModel)]="form.isInstallment" />
            <span>Parcelado</span>
          </label>

          <label class="toggle" *ngIf="!form.isInstallment">
            <input name="isFixed" type="checkbox" [(ngModel)]="form.isFixed" />
            <span>Gasto fixo mensal</span>
          </label>
        </div>

        <label *ngIf="form.isInstallment">
          <span>Numero de parcelas</span>
          <input name="totalInstallments" type="number" min="2" max="60" step="1" [(ngModel)]="form.totalInstallments" />
        </label>

        <section class="preview" *ngIf="form.isInstallment && installmentPreview().length > 0">
          <h3>Preview</h3>
          <ol>
            <li *ngFor="let item of installmentPreview()">
              <span>{{ item.number }}/{{ form.totalInstallments }}</span>
              <strong>{{ item.amount | currency:'BRL':'symbol':'1.2-2' }}</strong>
              <small>{{ item.date | date:'dd/MM/yyyy':'UTC' }}</small>
            </li>
          </ol>
        </section>

        <p class="feedback error" *ngIf="errorMessage()">{{ errorMessage() }}</p>
        <p class="feedback success" *ngIf="successMessage()">{{ successMessage() }}</p>

        <footer>
          <ui-button type="button" variant="secondary" (click)="close()">Cancelar</ui-button>
          <ui-button type="submit" [disabled]="isSubmitting()">{{ form.isInstallment ? 'Salvar parcelas' : 'Salvar gasto' }}</ui-button>
        </footer>
      </form>
    </section>
  `,
  styles: [`
    .fab {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 30;
      width: 56px;
      height: 56px;
      border: 0;
      border-radius: 50%;
      background: var(--color-primary);
      color: var(--color-white);
      font-size: 28px;
      line-height: 1;
      box-shadow: var(--shadow-soft);
      cursor: pointer;
    }

    .sheet-backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      display: grid;
      place-items: end center;
      padding: 16px;
      background: var(--color-overlay);
    }

    .sheet {
      width: min(680px, 100%);
      max-height: min(760px, calc(100vh - 32px));
      overflow: auto;
      display: grid;
      gap: 14px;
      border: 1px solid var(--color-hairline);
      border-radius: 18px;
      padding: 22px;
      background: var(--color-canvas);
      color: var(--color-ink);
      box-shadow: var(--shadow-soft);
    }

    header,
    footer,
    .field-grid,
    .toggle-row {
      display: flex;
      gap: 12px;
    }

    header,
    footer {
      justify-content: space-between;
      align-items: center;
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

    label {
      display: grid;
      flex: 1;
      gap: 7px;
      color: var(--color-body);
      font-size: 0.85rem;
      font-weight: 700;
    }

    input,
    select,
    textarea {
      width: 100%;
      border: 1px solid var(--color-hairline);
      border-radius: 10px;
      padding: 12px 13px;
      background: var(--color-surface-strong);
      color: var(--color-ink);
      font: inherit;
      font-weight: 500;
    }

    textarea {
      resize: vertical;
    }

    .icon-button {
      width: 36px;
      height: 36px;
      border: 1px solid var(--color-hairline);
      border-radius: 50%;
      background: var(--color-surface-strong);
      cursor: pointer;
      font-size: 16px;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
    }

    .toggle input {
      width: auto;
    }

    .preview {
      display: grid;
      gap: 8px;
      border: 1px solid var(--color-hairline-soft);
      border-radius: 10px;
      padding: 12px;
      background: var(--color-surface-strong);
    }

    .preview h3 {
      margin: 0;
      font-size: 0.9rem;
    }

    .preview ol {
      margin: 0;
      padding: 0;
      display: grid;
      gap: 6px;
      list-style: none;
    }

    .preview li {
      display: grid;
      grid-template-columns: 64px 1fr auto;
      gap: 8px;
      align-items: center;
      font-size: 0.82rem;
    }

    .preview span,
    .preview strong {
      font-family: var(--font-mono);
    }

    .preview small {
      color: var(--color-muted);
    }

    .feedback {
      margin: 0;
      font-size: 0.86rem;
    }

    .error { color: var(--color-semantic-down); }
    .success { color: var(--color-semantic-up); }

    @media (max-width: 680px) {
      .fab {
        right: 18px;
        bottom: 76px;
      }

      .field-grid,
      .toggle-row,
      footer {
        flex-direction: column;
      }

      .preview li {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NewExpenseFabComponent {
  readonly today = new Date().toISOString().slice(0, 10);
  readonly isOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly categories = signal<ExpenseCategory[]>([]);
  readonly familyMembers = signal<FamilyMember[]>([]);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  form: ExpenseFormState = this.initialForm();

  constructor(
    private readonly categoriesFacade: CategoriesFacade,
    private readonly expensesFacade: ExpensesFacade,
    private readonly familyMembersFacade: FamilyMembersFacade,
    private readonly monthService: MonthService
  ) {}

  open(): void {
    this.form = this.initialForm();
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isOpen.set(true);
    this.loadOptions();
  }

  close(): void {
    this.isOpen.set(false);
  }

  installmentPreview(): InstallmentPreviewItem[] {
    return this.buildInstallmentPreview();
  }

  submit(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const amount = this.parseAmount(this.form.amount);
    if (!this.form.description.trim() || !Number.isFinite(amount) || amount <= 0 || !this.form.expenseDate) {
      this.errorMessage.set('Preencha descricao, valor e data para salvar.');
      return;
    }

    if (this.form.isInstallment) {
      this.submitInstallments(amount);
      return;
    }

    this.isSubmitting.set(true);
    this.expensesFacade.create({
      description: this.form.description.trim(),
      amount,
      expenseDate: this.form.expenseDate,
      categoryId: this.form.categoryId || null,
      familyMemberId: this.form.familyMemberId || null,
      paymentMethod: this.trimToNull(this.form.paymentMethod),
      notes: this.trimToNull(this.form.notes),
      isFixed: this.form.isFixed
    }).pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: () => {
        this.successMessage.set('Gasto criado com sucesso.');
        this.form = this.initialForm();
      },
      error: () => this.errorMessage.set('Nao foi possivel criar o gasto agora.')
    });
  }

  private submitInstallments(totalAmount: number): void {
    const totalInstallments = Number(this.form.totalInstallments);
    if (!Number.isInteger(totalInstallments) || totalInstallments < 2 || totalInstallments > 60) {
      this.errorMessage.set('Informe entre 2 e 60 parcelas.');
      return;
    }

    this.isSubmitting.set(true);
    this.expensesFacade.createInstallments({
      description: this.form.description.trim(),
      totalAmount,
      totalInstallments,
      firstDueDate: this.form.expenseDate,
      categoryId: this.form.categoryId || null,
      familyMemberId: this.form.familyMemberId || null,
      paymentMethod: this.trimToNull(this.form.paymentMethod)
    }).pipe(finalize(() => this.isSubmitting.set(false))).subscribe({
      next: (expenses) => {
        this.successMessage.set(`${expenses.length} parcelas criadas com sucesso.`);
        this.form = this.initialForm();
      },
      error: () => this.errorMessage.set('Nao foi possivel criar o parcelamento agora.')
    });
  }

  private loadOptions(): void {
    this.categoriesFacade.list().pipe(catchError(() => of([]))).subscribe((categories) => this.categories.set(categories));
    this.familyMembersFacade.list().pipe(catchError(() => of([]))).subscribe((members) => this.familyMembers.set(members));
  }

  private initialForm(): ExpenseFormState {
    const period = this.monthService.period();
    const current = new Date();
    const day = period.month === current.getMonth() + 1 && period.year === current.getFullYear() ? current.getDate() : 1;
    const date = new Date(period.year, period.month - 1, day).toISOString().slice(0, 10);

    return {
      description: '',
      amount: '',
      expenseDate: date,
      categoryId: '',
      familyMemberId: '',
      paymentMethod: '',
      notes: '',
      isFixed: false,
      isInstallment: false,
      totalInstallments: 2
    };
  }

  private buildInstallmentPreview(): InstallmentPreviewItem[] {
    const totalAmount = this.parseAmount(this.form.amount);
    const totalInstallments = Number(this.form.totalInstallments);
    if (!this.form.isInstallment || !Number.isFinite(totalAmount) || totalAmount <= 0 || !Number.isInteger(totalInstallments) || totalInstallments < 2 || !this.form.expenseDate) {
      return [];
    }

    const totalCents = Math.round(totalAmount * 100);
    const baseCents = Math.floor(totalCents / totalInstallments);
    const remainder = totalCents % totalInstallments;
    const [year, month, day] = this.form.expenseDate.split('-').map(Number);

    return Array.from({ length: totalInstallments }, (_, index) => {
      const cents = baseCents + (index < remainder ? 1 : 0);
      const date = new Date(year, month - 1 + index, day).toISOString().slice(0, 10);
      return {
        number: index + 1,
        amount: cents / 100,
        date
      };
    });
  }

  private parseAmount(value: string): number {
    const normalized = value.replace(/\./g, '').replace(',', '.');
    return Number(normalized);
  }

  private trimToNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
}
