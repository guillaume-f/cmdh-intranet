import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { User, UserRole } from '../../../../models/user.model'
import { UserService } from '../../../../user.service'

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  users: User[] = []
  loading = false

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loading = true
    this.userService.getAll().subscribe({
      next: users => { this.users = users; this.loading = false },
      error: () => { this.loading = false }
    })
  }

  initials(user: User): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }

  changeRole(user: User, role: UserRole): void {
    this.userService.updateRole(user.id, role).subscribe({
      next: updated => {
        const idx = this.users.findIndex(u => u.id === user.id)
        if (idx !== -1) this.users[idx] = { ...this.users[idx], role: updated.role }
      }
    })
  }

  toggleActive(user: User): void {
    this.userService.toggleActive(user.id, !user.active).subscribe({
      next: updated => {
        const idx = this.users.findIndex(u => u.id === user.id)
        if (idx !== -1) this.users[idx] = { ...this.users[idx], active: updated.active }
      }
    })
  }
}
