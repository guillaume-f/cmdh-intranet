// src/app/layout/shell/shell.component.ts
import { Component, computed, inject } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { AuthService } from '../../core/auth/auth.service'

const ROLE_LABELS: Record<string, string> = {
  candidate: 'Candidat',
  member: 'Membre',
  encoder: 'Encodeur',
  admin: 'Administrateur',
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  private readonly authService = inject(AuthService)

  userName = computed(() => {
    const u = this.authService.currentUser()
    return u ? `${u.firstName} ${u.lastName}` : ''
  })

  userInitials = computed(() => {
    const u = this.authService.currentUser()
    if (!u) return '?'
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase()
  })

  roleLabel = computed(() => {
    const role = this.authService.userRole()
    return role ? ROLE_LABELS[role] ?? role : ''
  })

 canCreateActivity = computed(() => this.authService.can('activity:create'))
  canManageUsers    = computed(() => this.authService.can('user:manage'))
  logout(): void {
    this.authService.logout()
  }
}
