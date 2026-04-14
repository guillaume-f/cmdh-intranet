import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ForgotPasswordDto, ForgotPasswordDtoRequest, LoginDto, LoginDtoRequest, ResetPasswordDto, ResetPasswordDtoRequest } from './auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

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

}
