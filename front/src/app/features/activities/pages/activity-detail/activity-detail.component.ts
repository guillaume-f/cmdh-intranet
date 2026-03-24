import { CommonModule } from '@angular/common'
import { Component, OnInit, computed } from '@angular/core'
import { ActivatedRoute, RouterLink } from '@angular/router'
import { ActivityService } from '../../../../core/services/activity.service'
import { AuthService } from '../../../../core/services/auth.service'
import { Activity, ActivityCategory } from '../../../../models/activity.model'
import { Registration } from '../../../../models/registration.model'

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  reunion: 'Réunion',
  formation: 'Formation',
  evenement: 'Événement',
  autre: 'Autre',
}

const CATEGORY_CLASSES: Record<ActivityCategory, string> = {
  reunion: 'text-purple-400 bg-purple-400/10 border border-purple-400/20',
  formation: 'text-blue-400 bg-blue-400/10 border border-blue-400/20',
  evenement: 'text-green-400 bg-green-400/10 border border-green-400/20',
  autre: 'text-slate-400 bg-slate-400/10 border border-slate-400/20',
}

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activity-detail.component.html',
})
export class ActivityDetailComponent implements OnInit {
  activity: Activity | null = null
  registrations: Registration[] = []
  userRegistration: Registration | null = null

  loading = false
  registering = false
  successMessage = ''
  errorMessage = ''

  // Seuls member, encoder et admin peuvent s'inscrire (pas candidate)
  canRegister = computed(() => this.auth.hasMinRole('member'))
  canEncode = computed(() => this.auth.hasMinRole('encoder'))

  get registrationCount(): number {
    return this.registrations.filter(r => r.status === 'confirmed').length
  }

  get isFull(): boolean {
    return this.activity ? this.registrationCount >= this.activity.maxParticipants : false
  }

  get occupancyPercent(): number {
    if (!this.activity || this.activity.maxParticipants === 0) return 0
    return Math.min(100, Math.round((this.registrationCount / this.activity.maxParticipants) * 100))
  }

  constructor(
    private route: ActivatedRoute,
    private activityService: ActivityService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!
    this.loading = true

    this.activityService.getById(id).subscribe({
      next: activity => {
        this.activity = activity
        this.loadRegistrations(id)
      },
      error: () => { this.loading = false }
    })
  }

  private loadRegistrations(activityId: string): void {
    this.activityService.getRegistrationsForActivity(activityId).subscribe({
      next: regs => {
        this.registrations = regs
        const userId = this.auth.currentUser()?.id
        this.userRegistration = regs.find(r => r.userId === userId && r.status === 'confirmed') ?? null
        this.loading = false
      },
      error: () => { this.loading = false }
    })
  }

  register(): void {
    if (!this.activity) return
    this.registering = true
    this.errorMessage = ''

    const userId = this.auth.currentUser()!.id
    this.activityService.register(this.activity.id, userId).subscribe({
      next: reg => {
        this.registrations.push(reg)
        this.userRegistration = reg
        this.successMessage = 'Inscription confirmée !'
        this.registering = false
      },
      error: () => {
        this.errorMessage = "Erreur lors de l'inscription. Veuillez réessayer."
        this.registering = false
      }
    })
  }

  unregister(): void {
    if (!this.userRegistration) return
    this.registering = true
    this.errorMessage = ''

    this.activityService.unregister(this.userRegistration.id).subscribe({
      next: () => {
        this.registrations = this.registrations.filter(r => r.id !== this.userRegistration!.id)
        this.userRegistration = null
        this.successMessage = 'Désinscription effectuée.'
        this.registering = false
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la désinscription.'
        this.registering = false
      }
    })
  }

  categoryLabel(cat: ActivityCategory): string { return CATEGORY_LABELS[cat] ?? cat }
  categoryClass(cat: ActivityCategory): string { return CATEGORY_CLASSES[cat] ?? '' }
}
