import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDto } from '../../core/auth/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/users`;

  getAllUsers(): Observable<UserDto[]> {
    const token = this.getCookie('access_token');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    );

    return this.http.get<UserDto[]>(this.apiUrl, { headers });
  }

   getUserById(userId: string): Observable<UserDto> {
      const token = this.getCookie('access_token');
      const headers = new HttpHeaders().set(
        'Authorization',
        `Bearer ${token}`
      );
  
      return this.http.get<UserDto>(`${this.apiUrl}/${userId}`, { headers });
    }

  private getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return (parts.pop() as string).split(';').shift();
    }

    return undefined;
  }
}