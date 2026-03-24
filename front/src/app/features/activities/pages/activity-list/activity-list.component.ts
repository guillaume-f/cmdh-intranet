import { CommonModule } from '@angular/common'
import { Component, OnInit, computed } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterLink } from '@angular/router'
import { ActivityService } from '../../../../core/services/activity.service'
import { AuthService } from '../../../../core/services/auth.service'
import { Activity, ActivityCategory } from '../../../../models/activity.model'

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
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './activity-list.component.html',
})
export class ActivityListComponent implements OnInit {
  activities: Activity[] = []
  loading = false
  filterCategory = ''
  filterStatus = 'published'

  canEncode = computed(() => this.auth.hasMinRole('encoder'))

  constructor(
    private activityService: ActivityService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Les candidats et membres ne voient que les publiées
    if (!this.auth.hasMinRole('encoder')) {
      this.filterStatus = 'published'
    }
    this.loadActivities()
  }

  loadActivities(): void {
    this.loading = true
    const filters: any = { _sort: 'date', _order: 'asc' }
    if (this.filterCategory) filters.category = this.filterCategory
    if (this.filterStatus) filters.status = this.filterStatus

    this.activityService.getAll(filters).subscribe({
      next: data => {
        this.activities = data
        this.loading = false
      },
      error: () => { this.loading = false }
    })
  }

  categoryLabel(cat: ActivityCategory): string {
    return CATEGORY_LABELS[cat] ?? cat
  }

  categoryClass(cat: ActivityCategory): string {
    return CATEGORY_CLASSES[cat] ?? ''
  }
}
