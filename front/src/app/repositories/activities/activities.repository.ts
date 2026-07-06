import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActivityAttendanceDto } from './activity-participant.model';
import { ActivityDto, ActivityDtoRequest } from './activity.model';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/activities`;

  getAllActivities(): Observable<ActivityDto[]> {
    return this.http.get<ActivityDto[]>(this.apiUrl);
  }

  getActivityById(activityId: string): Observable<ActivityDto> {
    return this.http.get<ActivityDto>(`${this.apiUrl}/${activityId}`);
  }

  getActivityParticipants(activityId: string): Observable<ActivityAttendanceDto[]> {
    return this.http.get<ActivityAttendanceDto[]>(`${this.apiUrl}/${activityId}/participants`);
  }

  validateParticipantPresence(
    activityId: string,
    userId: string,
    isPresent: boolean,
  ): Observable<void> {
    const action = isPresent ? 'validate' : 'invalidate';
    return this.http.post<void>(
      `${this.apiUrl}/${activityId}/participants/${userId}/${action}`,
      null,
    );
  }

  deleteParticipantRegistration(activityId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${activityId}/participants/${userId}`);
  }

  addParticipantsWithPresence(activityId: string, userIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${activityId}/participants/bulk-add`, { userIds });
  }

  addActivity(activity: ActivityDtoRequest): Observable<ActivityDto> {
    return this.http.post<ActivityDto>(this.apiUrl, activity);
  }

  updateActivity(activityId: string, activity: ActivityDtoRequest): Observable<ActivityDto> {
    return this.http.patch<ActivityDto>(`${this.apiUrl}/${activityId}`, activity);
  }

  deleteActivity(activityId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${activityId}`);
  }

  register(activityId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${activityId}/register`, null);
  }

  unregister(activityId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${activityId}/unregister`, null);
  }
}
