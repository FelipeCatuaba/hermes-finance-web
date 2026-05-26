import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
  });

  it('renders main sections and CTA', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    expect(compiled.querySelector('.hero-actions ui-button')).toBeTruthy();
    expect(compiled.querySelector('#features')).toBeTruthy();
    expect(compiled.querySelector('#how')).toBeTruthy();
    expect(compiled.querySelector('#family')).toBeTruthy();
  });
});

