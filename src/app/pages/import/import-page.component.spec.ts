import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ImportPageComponent } from './import-page.component';
import { ApiService } from '../../core/http/api.service';
import { CategoriesFacade } from '../../core/facades/categories.facade';
import { FamilyMembersFacade } from '../../core/facades/family-members.facade';

describe('ImportPageComponent', () => {
  let fixture: ComponentFixture<ImportPageComponent>;
  let api: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    api = jasmine.createSpyObj<ApiService>('ApiService', ['importExpenses', 'importIncomes']);
    api.importExpenses.and.returnValue(of({ imported: 1, failed: 0, errors: [], monthsAffected: ['2026-03'] }));
    api.importIncomes.and.returnValue(of({ imported: 1, failed: 0, errors: [], monthsAffected: ['2026-03'] }));

    await TestBed.configureTestingModule({
      imports: [ImportPageComponent],
      providers: [
        {
          provide: CategoriesFacade,
          useValue: {
            list: () => of([{ id: 'category-1', name: 'Mercado', icon: null, colorHex: null, isDefault: true, active: true, createdAt: '' }])
          }
        },
        {
          provide: FamilyMembersFacade,
          useValue: {
            list: () => of([{ id: 'member-1', name: 'Isa', relation: null, active: true, createdAt: '' }])
          }
        },
        { provide: ApiService, useValue: api }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ImportPageComponent);
    fixture.detectChanges();
  });

  it('imports only valid expense preview rows', () => {
    const component = fixture.componentInstance;
    component.expenseRows = [
      {
        index: 0,
        lineNumber: 2,
        raw: { descricao: 'Mercado', valor: '120,50', data: '2026-03-10' },
        payload: {
          index: 0,
          description: 'Mercado',
          amount: 120.5,
          expenseDate: '2026-03-10',
          categoryId: null,
          familyMemberId: null
        },
        errors: []
      },
      {
        index: 1,
        lineNumber: 3,
        raw: { descricao: '', valor: '0' },
        payload: null,
        errors: ['Descricao obrigatoria']
      }
    ];

    component.submitActive();

    expect(api.importExpenses).toHaveBeenCalledOnceWith([
      jasmine.objectContaining({
        index: 0,
        description: 'Mercado',
        amount: 120.5,
        expenseDate: '2026-03-10'
      })
    ]);
  });

  it('submits income rows when the active tab is incomes', () => {
    const component = fixture.componentInstance;
    component.setTab('incomes');
    component.incomeRows = [
      {
        index: 0,
        lineNumber: 2,
        raw: { descricao: 'Salario', valor: 4500, data: '2026-03-05' },
        payload: {
          index: 0,
          description: 'Salario',
          amount: 4500,
          incomeDate: '2026-03-05',
          categoryId: null,
          isRecurring: true,
          notes: null
        },
        errors: []
      }
    ];

    component.submitActive();

    expect(api.importIncomes).toHaveBeenCalledOnceWith([
      jasmine.objectContaining({
        index: 0,
        description: 'Salario',
        amount: 4500,
        incomeDate: '2026-03-05'
      })
    ]);
  });
});
