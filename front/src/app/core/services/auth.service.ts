import { HttpClient } from '@angular/common/http'
import { computed, Injectable, signal } from '@angular/core'
import { Router } from '@angular/router'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { environment } from '../../../environments/environment'
import { AuthResponse, ROLE_HIERARCHY, User, UserRole } from '../../models/user.model'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'intranet_token'
  private readonly USER_KEY = 'intranet_user'

  // Signals pour état réactif
  currentUser = signal<User | null>(this.loadUserFromStorage())
  isAuthenticated = computed(() => !!this.currentUser())
  userRole = computed(() => this.currentUser()?.role ?? null)

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token)
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user))
        this.currentUser.set(response.user)
      })
    )
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
    this.currentUser.set(null)
    this.router.navigate(['/auth/login'])
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email })
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword })
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  /**
   * Vérifie si l'utilisateur courant a au moins le rôle requis
   * Ex: hasMinRole('encoder') → true pour encoder et admin
   */
  hasMinRole(minRole: UserRole): boolean {
    const role = this.userRole()
    if (!role) return false
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole]
  }

  hasRole(role: UserRole): boolean {
    return this.userRole() === role
  }

  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }
}
