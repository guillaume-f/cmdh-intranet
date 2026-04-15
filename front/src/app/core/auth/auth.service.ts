import { computed, inject, Injectable, signal } from '@angular/core'
import { Router } from '@angular/router'
import { Permission } from './permissions.type'
import { UserDto } from './user.model'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router)

  currentUser = signal<UserDto | null>(null)
  isAuthenticated = computed(() => !!this.currentUser())
  userRole = computed(() => this.currentUser()?.role ?? null)
  userPermissions = computed(() => this.currentUser()?.permissions ?? [])

  setUser(user: UserDto): void {
    this.currentUser.set(user)
  }

  setToken(token: string): void {
    document.cookie = `access_token=${encodeURIComponent(token)}; path=/; Secure; SameSite=Strict`;
  }

  logout(): void {
    this.currentUser.set(null)
    this.router.navigate(['/auth/login'])
  }

  can(permission: Permission): boolean {
    return this.userPermissions().includes(permission)
  }

  canAll(permissions: Permission[]): boolean {
    return permissions.every(p => this.can(p))
  }

  canAny(permissions: Permission[]): boolean {
    return permissions.some(p => this.can(p))
  }
}
