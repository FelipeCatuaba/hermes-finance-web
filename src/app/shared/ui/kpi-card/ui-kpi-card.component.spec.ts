import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiKpiCardComponent } from './ui-kpi-card.component';

describe('UiKpiCardComponent', () => {
  let fixture: ComponentFixture<UiKpiCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [UiKpiCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(UiKpiCardComponent);
    fixture.componentInstance.kpi = { label: 'Teste', value: 'R$ 10', trend: 'up' };
    fixture.detectChanges();
  });

  it('shows kpi value', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.textContent).toContain('R$ 10');
  });
});