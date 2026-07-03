import { routes } from './app.routes';
import { authGuard } from './core/auth/auth.guard';
import { environment } from '../environments/environment';

describe('security hardening', () => {
  it('keeps application routes lazy loaded and preserves the protected shell guard', () => {
    const protectedShell = routes.find((route) => route.canActivate?.includes(authGuard));

    expect(protectedShell).toBeDefined();
    expect(protectedShell?.loadComponent).toEqual(jasmine.any(Function));

    const eagerRoutes = routes.filter((route) => 'component' in route);
    const eagerChildRoutes = routes.flatMap((route) => route.children ?? []).filter((route) => 'component' in route);

    expect(eagerRoutes).toEqual([]);
    expect(eagerChildRoutes).toEqual([]);
  });

  it('does not ship real credentials in compile-time environment defaults', () => {
    const serialized = JSON.stringify(environment);

    expect(serialized).not.toContain('sk_');
    expect(serialized).not.toContain('pk_test_');
    expect(serialized).not.toContain('prepared-blowfish');
    expect(environment.clerkPublishableKey).toBe('');
  });
});
