import { Component, OnInit } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';
import { ApiService } from '../../core/http/api.service';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';
import { ExpenseCategory } from '../../core/models/expense-category.model';
import { FamilyMember } from '../../core/models/family-member.model';
import { ImportBatchResponse, ImportExpenseRequest, ImportIncomeRequest } from '../../core/models/import.model';
import { UiButtonComponent } from '../../shared/ui/button/ui-button.component';
import { UiCardComponent } from '../../shared/ui/card/ui-card.component';

type ImportTab = 'expenses' | 'incomes';
type RawImportRow = Record<string, unknown>;

interface PreviewRow<T> {
  index: number;
  lineNumber: number;
  raw: RawImportRow;
  payload: T | null;
  errors: string[];
}

@Component({
  selector: 'app-import-page',
  standalone: true,
  imports: [FormsModule, NgClass, NgFor, NgIf, UiButtonComponent, UiCardComponent],
  templateUrl: './import-page.component.html',
  styleUrl: './import-page.component.css'
})
export class ImportPageComponent implements OnInit {
  activeTab: ImportTab = 'expenses';
  categories: ExpenseCategory[] = [];
  familyMembers: FamilyMember[] = [];
  expenseRows: PreviewRow<ImportExpenseRequest>[] = [];
  incomeRows: PreviewRow<ImportIncomeRequest>[] = [];
  fileName = '';
  errorMessage = '';
  result: ImportBatchResponse | null = null;
  resultTab: ImportTab | null = null;
  isParsing = false;
  isSubmitting = false;

  constructor(
    private readonly api: ApiService,
    private readonly categoriesFacade: CategoriesFacade,
    private readonly familyMembersFacade: FamilyMembersFacade
  ) {}

  ngOnInit(): void {
    this.categoriesFacade.list().pipe(catchError(() => of([]))).subscribe((categories) => this.categories = categories);
    this.familyMembersFacade.list().pipe(catchError(() => of([]))).subscribe((members) => this.familyMembers = members);
  }

  setTab(tab: ImportTab): void {
    this.activeTab = tab;
  }

  async downloadTemplate(): Promise<void> {
    const xlsx = await import('xlsx');
    const workbook = xlsx.utils.book_new();
    const expenses = xlsx.utils.json_to_sheet([
      {
        descricao: 'Mercado',
        valor: 120.5,
        data: '2026-03-10',
        categoria: 'Alimentacao',
        membro: '',
        forma_pagamento: 'cartao',
        observacoes: 'Compra mensal',
        fixo: 'nao',
        parcelas: 1,
        primeira_data: ''
      },
      {
        descricao: 'Notebook',
        valor: 3000,
        data: '2026-03-15',
        categoria: 'Tecnologia',
        membro: 'Isa',
        forma_pagamento: 'cartao',
        observacoes: 'Parcelado',
        fixo: 'nao',
        parcelas: 10,
        primeira_data: '2026-03-15'
      }
    ]);
    const incomes = xlsx.utils.json_to_sheet([
      {
        descricao: 'Salario',
        valor: 4500,
        data: '2026-03-05',
        categoria: '',
        recorrente: 'sim',
        observacoes: 'CLT'
      }
    ]);

    xlsx.utils.book_append_sheet(workbook, expenses, 'Gastos');
    xlsx.utils.book_append_sheet(workbook, incomes, 'Receitas');
    xlsx.writeFile(workbook, 'finflow-template.xlsx');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.fileName = file.name;
    this.errorMessage = '';
    this.result = null;
    this.resultTab = null;
    this.isParsing = true;

    if (file.name.toLowerCase().endsWith('.csv')) {
      this.readCsv(file);
      return;
    }

    this.readWorkbook(file);
  }

  submitActive(): void {
    const payload = this.activeTab === 'expenses'
      ? this.expenseRows.flatMap((row) => row.payload ? [row.payload] : [])
      : this.incomeRows.flatMap((row) => row.payload ? [row.payload] : []);

    this.errorMessage = '';
    this.result = null;
    this.resultTab = this.activeTab;

    if (payload.length === 0) {
      this.errorMessage = 'Nao ha linhas validas para importar nesta aba.';
      return;
    }

    this.isSubmitting = true;
    const request$ = this.activeTab === 'expenses'
      ? this.api.importExpenses(payload as ImportExpenseRequest[])
      : this.api.importIncomes(payload as ImportIncomeRequest[]);

    request$.pipe(finalize(() => this.isSubmitting = false)).subscribe({
      next: (response) => {
        this.result = response;
        this.applyServerErrors(response);
      },
      error: () => this.errorMessage = 'Nao foi possivel importar o arquivo agora.'
    });
  }

  rowsForActiveTab(): Array<PreviewRow<ImportExpenseRequest> | PreviewRow<ImportIncomeRequest>> {
    return this.activeTab === 'expenses' ? this.expenseRows : this.incomeRows;
  }

  validCount(tab: ImportTab): number {
    const rows = tab === 'expenses' ? this.expenseRows : this.incomeRows;
    return rows.filter((row) => row.payload).length;
  }

  invalidCount(tab: ImportTab): number {
    const rows = tab === 'expenses' ? this.expenseRows : this.incomeRows;
    return rows.filter((row) => !row.payload).length;
  }

  totalCount(tab: ImportTab): number {
    return tab === 'expenses' ? this.expenseRows.length : this.incomeRows.length;
  }

  displayValue(row: PreviewRow<ImportExpenseRequest> | PreviewRow<ImportIncomeRequest>, aliases: string[]): string {
    const value = this.pick(row.raw, aliases);
    return value === null || value === undefined ? '' : String(value);
  }

  trackByIndex(_: number, row: PreviewRow<ImportExpenseRequest> | PreviewRow<ImportIncomeRequest>): number {
    return row.index;
  }

  private readWorkbook(file: File): void {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const xlsx = await import('xlsx');
        const workbook = xlsx.read(reader.result as ArrayBuffer, { type: 'array', cellDates: true });
        this.expenseRows = this.parseExpenseRows(this.sheetRows(workbook, xlsx, 'Gastos'));
        this.incomeRows = this.parseIncomeRows(this.sheetRows(workbook, xlsx, 'Receitas'));
      } catch {
        this.errorMessage = 'Nao foi possivel ler a planilha selecionada.';
      } finally {
        this.isParsing = false;
      }
    };
    reader.onerror = () => {
      this.errorMessage = 'Nao foi possivel ler o arquivo selecionado.';
      this.isParsing = false;
    };
    reader.readAsArrayBuffer(file);
  }

  private readCsv(file: File): void {
    const reader = new FileReader();
    reader.onload = async () => {
      const papa = await import('papaparse');
      papa.default.parse<RawImportRow>(String(reader.result ?? ''), {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const rows = result.data.filter((row) => Object.values(row).some((value) => String(value ?? '').trim()));
          if (this.activeTab === 'expenses') {
            this.expenseRows = this.parseExpenseRows(rows);
          } else {
            this.incomeRows = this.parseIncomeRows(rows);
          }
          this.isParsing = false;
        },
        error: () => {
          this.errorMessage = 'Nao foi possivel ler o CSV selecionado.';
          this.isParsing = false;
        }
      });
    };
    reader.onerror = () => {
      this.errorMessage = 'Nao foi possivel ler o arquivo selecionado.';
      this.isParsing = false;
    };
    reader.readAsText(file);
  }

  private sheetRows(workbook: import('xlsx').WorkBook, xlsx: typeof import('xlsx'), sheetName: string): RawImportRow[] {
    const exactSheet = workbook.Sheets[sheetName];
    const fallbackSheet = workbook.Sheets[workbook.SheetNames.find((name) => this.normalizeHeader(name) === this.normalizeHeader(sheetName)) ?? ''];
    const sheet = exactSheet ?? fallbackSheet;
    if (!sheet) {
      return [];
    }
    return xlsx.utils.sheet_to_json<RawImportRow>(sheet, { defval: '' });
  }

  private parseExpenseRows(rows: RawImportRow[]): PreviewRow<ImportExpenseRequest>[] {
    return rows.map((row, index) => {
      const errors: string[] = [];
      const description = this.requiredText(row, ['descricao', 'description'], 'Descricao', errors);
      const amount = this.requiredAmount(row, errors);
      const expenseDate = this.requiredDate(row, ['data', 'expenseDate', 'data_gasto'], 'Data', errors);
      const categoryId = this.resolveCategory(row, errors);
      const familyMemberId = this.resolveMember(row, errors);
      const totalInstallments = this.optionalPositiveInteger(row, ['parcelas', 'totalInstallments', 'total_parcelas'], 'Parcelas', errors);
      const firstDueDate = this.optionalDate(row, ['primeira_data', 'firstDueDate', 'primeira_parcela'], 'Primeira data', errors);
      const paymentMethod = this.optionalText(row, ['forma_pagamento', 'paymentMethod']);
      const notes = this.optionalText(row, ['observacoes', 'notes']);
      const isFixed = this.optionalBoolean(row, ['fixo', 'isFixed']);

      const payload = errors.length === 0 && description && amount !== null && expenseDate
        ? {
            index,
            description,
            amount,
            expenseDate,
            categoryId,
            familyMemberId,
            paymentMethod,
            notes,
            isFixed,
            totalInstallments,
            firstDueDate
          }
        : null;

      return { index, lineNumber: index + 2, raw: row, payload, errors };
    });
  }

  private parseIncomeRows(rows: RawImportRow[]): PreviewRow<ImportIncomeRequest>[] {
    return rows.map((row, index) => {
      const errors: string[] = [];
      const description = this.requiredText(row, ['descricao', 'description'], 'Descricao', errors);
      const amount = this.requiredAmount(row, errors);
      const incomeDate = this.requiredDate(row, ['data', 'incomeDate', 'data_receita'], 'Data', errors);
      const categoryId = this.resolveCategory(row, errors);
      const isRecurring = this.optionalBoolean(row, ['recorrente', 'isRecurring']);
      const notes = this.optionalText(row, ['observacoes', 'notes']);

      const payload = errors.length === 0 && description && amount !== null && incomeDate
        ? { index, description, amount, incomeDate, categoryId, isRecurring, notes }
        : null;

      return { index, lineNumber: index + 2, raw: row, payload, errors };
    });
  }

  private applyServerErrors(response: ImportBatchResponse): void {
    if (response.errors.length === 0) {
      return;
    }
    const rows = this.activeTab === 'expenses' ? this.expenseRows : this.incomeRows;
    const mapped = rows.map((row) => {
      const serverErrors = response.errors
        .filter((error) => error.index === row.index)
        .map((error) => `${error.field}: ${error.message}`);
      return serverErrors.length > 0 ? { ...row, errors: [...row.errors, ...serverErrors], payload: null } : row;
    });
    if (this.activeTab === 'expenses') {
      this.expenseRows = mapped as PreviewRow<ImportExpenseRequest>[];
    } else {
      this.incomeRows = mapped as PreviewRow<ImportIncomeRequest>[];
    }
  }

  private requiredText(row: RawImportRow, aliases: string[], label: string, errors: string[]): string | null {
    const value = this.optionalText(row, aliases);
    if (!value) {
      errors.push(`${label} obrigatoria`);
      return null;
    }
    if (value.length > 255) {
      errors.push(`${label} deve ter no maximo 255 caracteres`);
      return null;
    }
    return value;
  }

  private optionalText(row: RawImportRow, aliases: string[]): string | null {
    const value = this.pick(row, aliases);
    const trimmed = value === null || value === undefined ? '' : String(value).trim();
    return trimmed || null;
  }

  private requiredAmount(row: RawImportRow, errors: string[]): number | null {
    const raw = this.pick(row, ['valor', 'amount']);
    const value = this.parseAmount(raw);
    if (value === null || value <= 0) {
      errors.push('Valor deve ser maior que zero');
      return null;
    }
    return value;
  }

  private parseAmount(value: unknown): number | null {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    const raw = String(value ?? '').trim();
    if (!raw) {
      return null;
    }
    const normalized = raw.includes(',')
      ? raw.replace(/\./g, '').replace(',', '.')
      : raw;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private requiredDate(row: RawImportRow, aliases: string[], label: string, errors: string[]): string | null {
    const value = this.parseDate(this.pick(row, aliases));
    if (!value) {
      errors.push(`${label} obrigatoria`);
      return null;
    }
    return value;
  }

  private optionalDate(row: RawImportRow, aliases: string[], label: string, errors: string[]): string | null {
    const raw = this.pick(row, aliases);
    if (raw === null || raw === undefined || String(raw).trim() === '') {
      return null;
    }
    const value = this.parseDate(raw);
    if (!value) {
      errors.push(`${label} invalida`);
      return null;
    }
    return value;
  }

  private parseDate(value: unknown): string | null {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return this.formatDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
    }
    if (typeof value === 'number') {
      return this.excelSerialDate(value);
    }
    const raw = String(value ?? '').trim();
    if (!raw) {
      return null;
    }
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (iso) {
      return raw;
    }
    const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
    if (br) {
      return this.formatDate(Number(br[3]), Number(br[2]), Number(br[1]));
    }
    return null;
  }

  private optionalPositiveInteger(row: RawImportRow, aliases: string[], label: string, errors: string[]): number | null {
    const raw = this.pick(row, aliases);
    if (raw === null || raw === undefined || String(raw).trim() === '') {
      return null;
    }
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 60) {
      errors.push(`${label} deve ser um numero entre 1 e 60`);
      return null;
    }
    return parsed;
  }

  private optionalBoolean(row: RawImportRow, aliases: string[]): boolean {
    const raw = this.pick(row, aliases);
    const value = this.normalizeHeader(String(raw ?? ''));
    return ['sim', 's', 'true', '1', 'yes'].includes(value);
  }

  private resolveCategory(row: RawImportRow, errors: string[]): string | null {
    const raw = this.optionalText(row, ['categoria', 'category', 'categoryId']);
    if (!raw) {
      return null;
    }
    const found = this.categories.find((category) => category.id === raw || this.normalizeHeader(category.name) === this.normalizeHeader(raw));
    if (!found) {
      errors.push(`Categoria nao encontrada: ${raw}`);
      return null;
    }
    return found.id;
  }

  private resolveMember(row: RawImportRow, errors: string[]): string | null {
    const raw = this.optionalText(row, ['membro', 'familyMember', 'familyMemberId', 'de_quem']);
    if (!raw) {
      return null;
    }
    const found = this.familyMembers.find((member) => member.id === raw || this.normalizeHeader(member.name) === this.normalizeHeader(raw));
    if (!found) {
      errors.push(`Membro nao encontrado: ${raw}`);
      return null;
    }
    return found.id;
  }

  private pick(row: RawImportRow, aliases: string[]): unknown {
    const normalizedAliases = aliases.map((alias) => this.normalizeHeader(alias));
    const entry = Object.entries(row).find(([key]) => normalizedAliases.includes(this.normalizeHeader(key)));
    return entry ? entry[1] : null;
  }

  private normalizeHeader(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  private formatDate(year: number, month: number, day: number): string {
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  private excelSerialDate(value: number): string | null {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }
    const epoch = Date.UTC(1899, 11, 30);
    const date = new Date(epoch + Math.floor(value) * 24 * 60 * 60 * 1000);
    return this.formatDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  }
}
