import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { forkJoin } from 'rxjs'
import { ActivityService } from '../../../../core/services/activity.service'
import { Activity } from '../../../../models/activity.model'
import { Registration } from '../../../../models/registration.model'
import { User, UserRole } from '../../../../models/user.model'
import { UserService } from '../../../../user.service'

const ROLE_LABELS: Record<UserRole, string> = {
  candidate: 'Candidat',
  member: 'Membre',
  encoder: 'Encodeur',
  admin: 'Administrateur',
}

interface ParticipantRow {
  registration: Registration
  user: User | undefined
}

@Component({
  selector: 'app-activity-participants',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activity-participants.component.html',
})
export class ActivityParticipantsComponent implements OnInit {
  activityId!: string
  activity: Activity | null = null
  participants: ParticipantRow[] = []
  loading = false

  get confirmedCount(): number {
    return this.participants.length
  }

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.activityId = this.route.snapshot.paramMap.get('id')!
    this.loading = true

    forkJoin({
      activity: this.activityService.getById(this.activityId),
      registrations: this.activityService.getRegistrationsForActivity(this.activityId),
      users: this.userService.getAll(),
    }).subscribe({
      next: ({ activity, registrations, users }) => {
        this.activity = activity
        const confirmed = registrations.filter(r => r.status === 'confirmed')
        this.participants = confirmed.map(reg => ({
          registration: reg,
          user: users.find(u => u.id === reg.userId),
        }))
        this.loading = false
      },
      error: () => { this.loading = false }
    })
  }

  initials(user: User | undefined): string {
    if (!user) return '?'
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }

  roleLabel(role: UserRole | undefined): string {
    return role ? (ROLE_LABELS[role] ?? role) : '—'
  }
}
