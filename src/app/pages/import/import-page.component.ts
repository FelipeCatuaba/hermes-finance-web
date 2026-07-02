import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { ExpensesFacade } from '../../core/facades/expenses.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { ExpenseCategory } from '../../core/models/expense-category.model';
import { ExpenseBulkCreateRequest, ExpenseBulkCreateResponse, ExpenseBulkItemError } from '../../core/models/expense.model';
import { FamilyMember } from '../../core/models/family-member.model';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

interface ImportRow {
  id: number;
  description: string;
  amount: string;
  expenseDate: string;
  categoryId: string;
  familyMemberId: string;
}

@Component({
  selector: 'app-import-page',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, UiButtonComponent, UiCardComponent],
  templateUrl: './import-page.component.html',
  styleUrl: './import-page.component.css'
})
export class ImportPageComponent implements OnInit {
  readonly maxRows = 50;
  private nextId = 1;

  rows: ImportRow[] = [this.createRow()];
  categories: ExpenseCategory[] = [];
  familyMembers: FamilyMember[] = [];
  isSubmitting = false;
  errorMessage = '';
  result: ExpenseBulkCreateResponse | null = null;

  private submittedRowIds: number[] = [];

  constructor(
    private readonly categoriesFacade: CategoriesFacade,
    private readonly expensesFacade: ExpensesFacade,
    private readonly familyMembersFacade: FamilyMembersFacade
  ) {}

  ngOnInit(): void {
    this.categoriesFacade.list().pipe(catchError(() => of([]))).subscribe((categories) => this.categories = categories);
    this.familyMembersFacade.list().pipe(catchError(() => of([]))).subscribe((members) => this.familyMembers = members);
  }

  addRow(): void {
    if (this.rows.length >= this.maxRows) {
      return;
    }
    this.rows = [...this.rows, this.createRow()];
  }

  removeRow(index: number): void {
    if (this.rows.length === 1) {
      this.rows = [this.createRow()];
      return;
    }
    this.rows = this.rows.filter((_, currentIndex) => currentIndex !== index);
  }

  submit(): void {
    const { payload, rowIds } = this.toPayload();
    this.result = null;
    this.errorMessage = '';

    if (payload.length === 0) {
      this.errorMessage = 'Preencha ao menos uma linha para importar.';
      return;
    }

    this.isSubmitting = true;
    this.submittedRowIds = rowIds;
    this.expensesFacade.bulkCreate(payload).pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: (response) => {
        this.result = response;
        if (response.createdCount > 0) {
          const failedPayloadIndexes = new Set(response.errors.map((error) => error.index));
          const successfulRowIds = rowIds.filter((_, payloadIndex) => !failedPayloadIndexes.has(payloadIndex));
          this.rows = this.rows.filter((row) => !successfulRowIds.includes(row.id));
          if (this.rows.length === 0) {
            this.rows = [this.createRow()];
          }
        }
      },
      error: () => this.errorMessage = 'Nao foi possivel importar os gastos agora.'
    });
  }

  errorsForRow(rowId: number): ExpenseBulkItemError[] {
    if (!this.result) {
      return [];
    }
    return this.result.errors.filter((error) => this.submittedRowIds[error.index] === rowId);
  }

  trackByRow(_: number, row: ImportRow): number {
    return row.id;
  }

  private toPayload(): { payload: ExpenseBulkCreateRequest[]; rowIds: number[] } {
    const payload: ExpenseBulkCreateRequest[] = [];
    const rowIds: number[] = [];

    this.rows.forEach((row) => {
      if (!this.hasAnyValue(row)) {
        return;
      }

      payload.push({
        description: this.trimToNull(row.description),
        amount: this.parseAmount(row.amount),
        expenseDate: row.expenseDate || null,
        categoryId: row.categoryId || null,
        familyMemberId: row.familyMemberId || null
      });
      rowIds.push(row.id);
    });

    return { payload, rowIds };
  }

  private hasAnyValue(row: ImportRow): boolean {
    return Boolean(row.description.trim() || row.amount.trim() || row.expenseDate || row.categoryId || row.familyMemberId);
  }

  private parseAmount(value: string): number | null {
    if (!value.trim()) {
      return null;
    }
    const parsed = Number(value.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  private trimToNull(value: string): string | null {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private createRow(): ImportRow {
    return {
      id: this.nextId++,
      description: '',
      amount: '',
      expenseDate: '',
      categoryId: '',
      familyMemberId: ''
    };
  }
}
