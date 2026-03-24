import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from '../../../environments/environment'
import { Activity, ActivityFormData } from '../../models/activity.model'
import { Registration } from '../../models/registration.model'

export interface ActivityFilters {
  status?: string
  category?: string
  _sort?: string
  _order?: 'asc' | 'desc'
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private base = `${environment.apiUrl}/api/activities`
  private regBase = `${environment.apiUrl}api//registrations`

  constructor(private http: HttpClient) {}

  getAll(filters: ActivityFilters = {}): Observable<Activity[]> {
    let params = new HttpParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, v)
    })
    return this.http.get<Activity[]>(this.base, { params })
  }

  getById(id: string): Observable<Activity> {
    return this.http.get<Activity>(`${this.base}/${id}`)
  }

  create(data: ActivityFormData): Observable<Activity> {
    return this.http.post<Activity>(this.base, data)
  }

  update(id: string, data: Partial<ActivityFormData>): Observable<Activity> {
    return this.http.patch<Activity>(`${this.base}/${id}`, data)
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`)
  }

  // --- Inscriptions ---

  getRegistrationsForActivity(activityId: string): Observable<Registration[]> {
    return this.http.get<Registration[]>(this.regBase, {
      params: new HttpParams().set('activityId', activityId)
    })
  }

  getRegistrationsForUser(userId: string): Observable<Registration[]> {
    return this.http.get<Registration[]>(this.regBase, {
      params: new HttpParams().set('userId', userId)
    })
  }

  register(activityId: string, userId: string): Observable<Registration> {
    const registration: Omit<Registration, 'id'> = {
      activityId,
      userId,
      registeredAt: new Date().toISOString(),
      status: 'confirmed'
    }
    return this.http.post<Registration>(this.regBase, registration)
  }

  unregister(registrationId: string): Observable<void> {
    return this.http.delete<void>(`${this.regBase}/${registrationId}`)
  }
}
