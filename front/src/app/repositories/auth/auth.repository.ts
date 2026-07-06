import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH } from '../../core/auth/auth-http-context';
import { UserDto } from '../../core/auth/user.model';
import {
  ForgotPasswordDto,
  ForgotPasswordDtoRequest,
  RefreshDto,
  ResetPasswordDto,
  ResetPasswordDtoRequest,
} from './auth.model';
import { LoginDto, LoginDtoRequest } from './login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly skipAuthContext = new HttpContext().set(SKIP_AUTH, true);

  me(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/me`);
  }

  login(request: LoginDtoRequest): Observable<LoginDto> {
    return this.http.post<LoginDto>(`${this.apiUrl}/login`, request, {
      withCredentials: true,
      context: this.skipAuthContext,
    });
  }

  refresh(): Observable<RefreshDto> {
    return this.http.post<RefreshDto>(`${this.apiUrl}/refresh`, null, {
      withCredentials: true,
      context: this.skipAuthContext,
    });
  }

  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/logout`, null, {
      withCredentials: true,
      context: this.skipAuthContext,
    });
  }

  forgotPassword(request: ForgotPasswordDtoRequest): Observable<ForgotPasswordDto> {
    return this.http.post<ForgotPasswordDto>(`${this.apiUrl}/forgot-password`, request, {
      context: this.skipAuthContext,
    });
  }

  resetPassword(request: ResetPasswordDtoRequest): Observable<ResetPasswordDto> {
    return this.http.post<ResetPasswordDto>(`${this.apiUrl}/reset-password`, request, {
      context: this.skipAuthContext,
    });
  }
}
