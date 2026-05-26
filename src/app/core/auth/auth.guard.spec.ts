import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthSessionService } from './auth-session.service';

describe('authGuard', () => {
  it('allows navigation when authenticated', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthSessionService,
          useValue: {
            ensureAuthenticated: jasmine.createSpy().and.resolveTo(true)
          }
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: jasmine.createSpy()
          }
        }
      ]
    });

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('redirects when not authenticated', async () => {
    const urlTree = { redirected: true } as any;
    const createUrlTree = jasmine.createSpy().and.returnValue(urlTree);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthSessionService,
          useValue: {
            ensureAuthenticated: jasmine.createSpy().and.resolveTo(false)
          }
        },
        {
          provide: Router,
          useValue: {
            createUrlTree
          }
        }
      ]
    });

    const result = await TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(createUrlTree).toHaveBeenCalled();
    expect(result).toBe(urlTree);
  });
});