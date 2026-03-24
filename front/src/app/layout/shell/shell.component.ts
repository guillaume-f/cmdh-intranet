// src/app/layout/shell/shell.component.ts
import { Component, computed } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { AuthService } from '../../core/services/auth.service'

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
  userName = computed(() => {
    const u = this.auth.currentUser()
    return u ? `${u.firstName} ${u.lastName}` : ''
  })

  userInitials = computed(() => {
    const u = this.auth.currentUser()
    if (!u) return '?'
    return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase()
  })

  roleLabel = computed(() => {
    const role = this.auth.userRole()
    return role ? ROLE_LABELS[role] ?? role : ''
  })

  canEncode = computed(() => this.auth.hasMinRole('encoder'))
  isAdmin = computed(() => this.auth.hasRole('admin'))

  constructor(private readonly auth: AuthService) {}

  logout(): void {
    this.auth.logout()
  }
}
