import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthSelectorComponent } from './month-selector.component';

describe('MonthSelectorComponent', () => {
  let fixture: ComponentFixture<MonthSelectorComponent>;
  let component: MonthSelectorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MonthSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits selected month', () => {
    spyOn(component.monthChange, 'emit');
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = '4';
    select.dispatchEvent(new Event('change'));

    expect(component.monthChange.emit).toHaveBeenCalledWith(4);
  });
});