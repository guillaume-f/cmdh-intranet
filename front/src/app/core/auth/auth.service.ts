import { computed, inject, Injectable, signal } from '@angular/core'
import { Router } from '@angular/router'
import { Permission } from './permissions.type'
import { User } from './user.model'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router)

  currentUser = signal<User | null>(null)
  isAuthenticated = computed(() => !!this.currentUser())
  userRole = computed(() => this.currentUser()?.role ?? null)
  userPermissions = computed(() => this.currentUser()?.permissions ?? [])

  login(user: User): void {
    this.currentUser.set(user)
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
