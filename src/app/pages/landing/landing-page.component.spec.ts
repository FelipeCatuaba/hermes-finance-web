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
    expect(compiled.querySelector('#como-funciona')).toBeTruthy();
    expect(compiled.querySelector('#familia')).toBeTruthy();
    expect(compiled.querySelector('#auth')).toBeTruthy();
  });

  it('uses the required public anchors', () => {
    const compiled: HTMLElement = fixture.nativeElement;
    const links = Array.from(compiled.querySelectorAll('.nav-links a')).map((link) => link.getAttribute('href'));

    expect(links).toEqual(['#features', '#como-funciona', '#familia', '#auth']);
  });

  it('scrolls the hero CTA to the auth section and moves focus there', () => {
    jasmine.clock().install();
    const component = fixture.componentInstance;
    const event = jasmine.createSpyObj<Event>('event', ['preventDefault']);
    const authSection = fixture.nativeElement.querySelector('#auth') as HTMLElement;
    const scrollIntoView = spyOn(authSection, 'scrollIntoView');
    const focus = spyOn(authSection, 'focus');

    component.scrollToAuth(event);
    jasmine.clock().tick(450);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    jasmine.clock().uninstall();
  });
});

