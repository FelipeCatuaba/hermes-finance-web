import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthSessionService } from './auth-session.service';
import { publicAuthResetGuard } from './public-auth-reset.guard';

describe('publicAuthResetGuard', () => {
  it('allows public landing when visitor is not authenticated', async () => {
    const ensureAuthenticated = jasmine.createSpy().and.resolveTo(false);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthSessionService,
          useValue: {
            hasSessionHint: jasmine.createSpy().and.returnValue(false),
            ensureAuthenticated
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

    const result = await TestBed.runInInjectionContext(() => publicAuthResetGuard({} as any, {} as any));

    expect(result).toBeTrue();
    expect(ensureAuthenticated).not.toHaveBeenCalled();
  });

  it('redirects authenticated users to the dashboard', async () => {
    const urlTree = { redirected: true } as any;
    const createUrlTree = jasmine.createSpy().and.returnValue(urlTree);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthSessionService,
          useValue: {
            hasSessionHint: jasmine.createSpy().and.returnValue(true),
            ensureAuthenticated: jasmine.createSpy().and.resolveTo(true)
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

    const result = await TestBed.runInInjectionContext(() => publicAuthResetGuard({} as any, {} as any));

    expect(createUrlTree).toHaveBeenCalledOnceWith(['/dashboard']);
    expect(result).toBe(urlTree);
  });
});
