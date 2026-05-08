import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivityDto, ActivityDtoRequest } from './activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/activities`;

  getAllActivities(): Observable<ActivityDto[]> {
    const token = this.getCookie('access_token');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    );
    return  this.http
            .get<ActivityDto[]>(`${this.apiUrl}`, {headers}) 
  }

  getActivityById(activityId: string): Observable<ActivityDto> {
    const token = this.getCookie('access_token');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    );

    return this.http.get<ActivityDto>(`${this.apiUrl}/${activityId}`, { headers });
  }

  addActivity(activity: ActivityDtoRequest): Observable<ActivityDto> {
    const token = this.getCookie('access_token');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    ); 
  
    return this.http.post<ActivityDto>(`${this.apiUrl}`, activity, { headers });
  }

  register(activityId: string): Observable<void> {
    const token = this.getCookie('access_token');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    );

    return this.http.post<void>(`${this.apiUrl}/${activityId}/register`, null, { headers });
  }

  unregister(activityId: string): Observable<void> {
    const token = this.getCookie('access_token');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${token}`
    );

    return this.http.post<void>(`${this.apiUrl}/${activityId}/unregister`, null, { headers });
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
