import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { ActivityService } from '../../../../core/services/activity.service'
import { AuthService } from '../../../../core/services/auth.service'

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './activity-form.component.html',
})
export class ActivityFormComponent implements OnInit {
  activityForm!: FormGroup
  loading = false
  saving = false
  errorMessage = ''
  isEdit = false
  activityId: string | null = null

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activityId = this.route.snapshot.paramMap.get('id')
    this.isEdit = !!this.activityId

    this.activityForm = this.fb.group({
      title:           ['', Validators.required],
      description:     ['', Validators.required],
      date:            ['', Validators.required],
      time:            ['', Validators.required],
      location:        ['', Validators.required],
      points:          [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxParticipants: [20, [Validators.required, Validators.min(1)]],
      category:        ['evenement', Validators.required],
      status:          ['draft'],
    })

    if (this.isEdit && this.activityId) {
      this.loading = true
      this.activityService.getById(this.activityId).subscribe({
        next: activity => {
          this.activityForm.patchValue(activity)
          this.loading = false
        },
        error: () => { this.loading = false }
      })
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.activityForm.get(field)
    return !!(ctrl?.invalid && ctrl.touched)
  }

  onSubmit(): void {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched()
      return
    }

    this.saving = true
    this.errorMessage = ''

    const formData = {
      ...this.activityForm.value,
      createdBy: this.auth.currentUser()!.id,
      createdAt: new Date().toISOString(),
    }

    const request$ = this.isEdit
      ? this.activityService.update(this.activityId!, formData)
      : this.activityService.create(formData)

    request$.subscribe({
      next: activity => {
        this.router.navigate(['/activities', activity.id])
      },
      error: () => {
        this.errorMessage = "Erreur lors de l'enregistrement. Veuillez réessayer."
        this.saving = false
      }
    })
  }
}
