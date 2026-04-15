import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDto } from '../../core/auth/user.model';
import { ForgotPasswordDto, ForgotPasswordDtoRequest, ResetPasswordDto, ResetPasswordDtoRequest } from './auth.model';
import { LoginDto, LoginDtoRequest } from './login.model';

@Injectable({
  providedIn: 'root'
})
export class AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  me(): Observable<UserDto> {
    const token = this.getCookie('access_token');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    );
    return  this.http
            .get<UserDto>(`${this.apiUrl}/me`, {headers}) 
  }


  login(request: LoginDtoRequest): Observable<LoginDto> {
    return  this.http
            .post<LoginDto>(`${this.apiUrl}/login`, request) 
  }

  forgotPassword(request: ForgotPasswordDtoRequest): Observable<ForgotPasswordDto> {
    return  this.http
            .post<ForgotPasswordDto>(`${this.apiUrl}/login`, request) 
  }

  resetPassword(request: ResetPasswordDtoRequest): Observable<ResetPasswordDto> {
    return  this.http
            .post<ResetPasswordDto>(`${this.apiUrl}/login`, request) 
  }

  getCookie(name: string): string | undefined {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return (parts.pop() as string).split(';').shift();
        }
        return undefined;
    }

}
