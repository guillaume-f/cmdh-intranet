import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/profile`;

  updateEmail(email?: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}`, { email });
  }

  updatePassword(currentPassword?: string, password?: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/password`, { currentPassword, password });
  }
}
