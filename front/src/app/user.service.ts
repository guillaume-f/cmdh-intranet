// src/app/core/services/user.service.ts
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { environment } from '../environments/environment'
import { User } from './models/user.model'

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base).pipe(
      // Ne jamais exposer le mot de passe côté client
      map(users => users.map(({ ...u }) => { delete (u as any).password; return u }))
    )
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`)
  }

  update(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, data)
  }

  updateRole(id: string, role: User['role']): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, { role })
  }

  toggleActive(id: string, active: boolean): Observable<User> {
    return this.http.patch<User>(`${this.base}/${id}`, { active })
  }
}
