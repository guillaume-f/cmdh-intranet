import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
    AuthUser,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
} from '../types/auth.types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';

  // State signals
  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  login(request: LoginRequest): Observable<LoginResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return new Observable((observer) => {
      this.http
        .post<LoginResponse>(`${this.apiUrl}/login`, request)
        .subscribe({
          next: (response) => {
            this.currentUser.set(response.user);
            this.isAuthenticated.set(true);
            this.isLoading.set(false);
            observer.next(response);
            observer.complete();
          },
          error: (err) => {
            this.isLoading.set(false);
            const message = this.extractErrorMessage(err);
            this.error.set(message);
            observer.error(err);
          },
        });
    });
  }

  forgotPassword(
    request: ForgotPasswordRequest
  ): Observable<ForgotPasswordResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return new Observable((observer) => {
      this.http
        .post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, request)
        .subscribe({
          next: (response) => {
            this.isLoading.set(false);
            observer.next(response);
            observer.complete();
          },
          error: (err) => {
            this.isLoading.set(false);
            const message = this.extractErrorMessage(err);
            this.error.set(message);
            observer.error(err);
          },
        });
    });
  }

  resetPassword(
    request: ResetPasswordRequest
  ): Observable<ResetPasswordResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return new Observable((observer) => {
      this.http
        .post<ResetPasswordResponse>(`${this.apiUrl}/reset-password`, request)
        .subscribe({
          next: (response) => {
            this.isLoading.set(false);
            observer.next(response);
            observer.complete();
          },
          error: (err) => {
            this.isLoading.set(false);
            const message = this.extractErrorMessage(err);
            this.error.set(message);
            observer.error(err);
          },
        });
    });
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.error.set(null);
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    if (error.error && typeof error.error === 'object') {
      return error.error.message || 'Une erreur est survenue';
    }
    return error.message || 'Une erreur est survenue';
  }
}
