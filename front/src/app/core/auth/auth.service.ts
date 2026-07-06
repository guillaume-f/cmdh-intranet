import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, take } from 'rxjs';
import { RefreshDto } from '../../repositories/auth/auth.model';
import { AuthRepository } from '../../repositories/auth/auth.repository';
import { Permission } from './permissions.type';
import { UserDto } from './user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly authRepository = inject(AuthRepository);

  currentUser = signal<UserDto | null>(null);
  private readonly accessToken = signal<string | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role ?? null);
  userPermissions = computed(() => this.currentUser()?.permissions ?? []);

  setUser(user: UserDto): void {
    this.currentUser.set(user);
  }

  setAccessToken(token: string): void {
    this.accessToken.set(token);
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  refreshAccessToken(): Observable<RefreshDto> {
    return this.authRepository.refresh();
  }

  clearAuthState(): void {
    this.currentUser.set(null);
    this.accessToken.set(null);
  }

  logout(): void {
    this.authRepository
      .logout()
      .pipe(
        take(1),
        catchError(() => of({ success: false })),
      )
      .subscribe(() => {
        this.logoutLocal();
      });
  }

  logoutLocal(): void {
    this.clearAuthState();
    void this.router.navigate(['/auth/login']);
  }

  can(permission: Permission): boolean {
    return this.userPermissions().includes(permission);
  }

  canAll(permissions: Permission[]): boolean {
    return permissions.every((p) => this.can(p));
  }

  canAny(permissions: Permission[]): boolean {
    return permissions.some((p) => this.can(p));
  }
}
