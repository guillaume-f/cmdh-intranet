import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivityRegisterDto } from './register.model';

@Injectable({
  providedIn: 'root'
})
export class RegistersRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/registrations`;

  register(activityId: string): Observable<ActivityRegisterDto> {
    return this.http.put<ActivityRegisterDto>(`${this.apiUrl}/${activityId}`, {}, { headers: this.getAuthHeaders() });
  }

  unregister(activityId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${activityId}`, { headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getCookie('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
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
