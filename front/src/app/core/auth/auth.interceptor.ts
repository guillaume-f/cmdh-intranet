import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, finalize, map, shareReplay, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH } from './auth-http-context';
import { AuthService } from './auth.service';

let refreshInFlight$: Observable<string> | null = null;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (req.context.get(SKIP_AUTH) || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const authorizedRequest = token ? withBearer(req, token) : req;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isAuthEndpoint(req.url)
      ) {
        return throwError(() => error);
      }

      return handleUnauthorized(next, req, authService);
    }),
  );
};

function handleUnauthorized(
  next: HttpHandlerFn,
  originalRequest: HttpRequest<unknown>,
  authService: AuthService,
): Observable<HttpEvent<unknown>> {
  if (!refreshInFlight$) {
    refreshInFlight$ = authService.refreshAccessToken().pipe(
      map((response) => {
        authService.setAccessToken(response.token);
        return response.token;
      }),
      finalize(() => {
        refreshInFlight$ = null;
      }),
      shareReplay(1),
      catchError((error: unknown) => {
        authService.logoutLocal();
        return throwError(() => error);
      }),
    );
  }

  return refreshInFlight$.pipe(switchMap((token) => next(withBearer(originalRequest, token))));
}

function withBearer(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function isAuthEndpoint(url: string): boolean {
  return (
    url.startsWith(`${environment.apiUrl}/auth/login`) ||
    url.startsWith(`${environment.apiUrl}/auth/refresh`) ||
    url.startsWith(`${environment.apiUrl}/auth/logout`)
  );
}
