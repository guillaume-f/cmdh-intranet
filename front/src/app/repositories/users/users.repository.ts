import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDto } from '../../core/auth/user.model';
import { UserDtoRequest } from './user-dto-request.model';
import { UserValidatedActivitiesSummaryDto } from './user-validated-activity.model';

@Injectable({
  providedIn: 'root',
})
export class UsersRepository {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.apiUrl);
  }

  getUserById(userId: string): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/${userId}`);
  }

  getValidatedActivitiesByUserId(userId: string): Observable<UserValidatedActivitiesSummaryDto> {
    return this.http.get<UserValidatedActivitiesSummaryDto>(
      `${this.apiUrl}/${userId}/validated-activities`,
    );
  }

  updateUser(userId: string, user: UserDtoRequest): Observable<UserDto> {
    return this.http.patch<UserDto>(`${this.apiUrl}/${userId}`, user);
  }

  addUser(user: UserDtoRequest): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.apiUrl}`, user);
  }
}
