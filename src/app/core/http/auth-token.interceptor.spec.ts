import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { authTokenInterceptor } from './auth-token.interceptor';
import { AuthSessionService } from '../auth/auth-session.service';

describe('authTokenInterceptor', () => {
  it('injects bearer token when available', (done) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthSessionService,
          useValue: {
            getToken: jasmine.createSpy().and.resolveTo('token-123')
          }
        }
      ]
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.get('/api/health').subscribe(() => {
      done();
    });

    setTimeout(() => {
      const req = httpMock.expectOne('/api/health');
      expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
      req.flush({ status: 'ok' });
      httpMock.verify();
    }, 0);
  });

  it('does not inject bearer token into public API requests', (done) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authTokenInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthSessionService,
          useValue: {
            getToken: jasmine.createSpy().and.resolveTo('token-123')
          }
        }
      ]
    });

    const http = TestBed.inject(HttpClient);
    const httpMock = TestBed.inject(HttpTestingController);

    http.get('/api/public/share/raw-token').subscribe(() => {
      done();
    });

    const req = httpMock.expectOne('/api/public/share/raw-token');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({ total: 0, expenses: [] });
    httpMock.verify();
  });
});
