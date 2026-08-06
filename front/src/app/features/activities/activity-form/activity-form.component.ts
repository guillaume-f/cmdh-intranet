import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { finalize } from 'rxjs';
import { ActivitiesRepository } from '../../../repositories/activities/activities.repository';
import { ActivityDto } from '../../../repositories/activities/activity.model';
import { toActivityDtoRequest } from './activity-form.converter';
import { ActivityForm, ActivityFormValue } from './models/activity-form.model';

@Component({
  selector: 'app-activity-form',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    MessageModule,
    SelectModule,
    ButtonModule,
    ToggleSwitchModule,
    TranslatePipe,
    BreadcrumbModule,
  ],
  templateUrl: './activity-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFormComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  protected readonly activityId = signal(
    this.activatedRoute.snapshot.paramMap.get('activityId') ?? '',
  );
  protected readonly isEditMode = computed(() => !!this.activityId());
  protected readonly isLoading = signal(false);

  protected readonly pointsOptions = [0, 1, 3, 5];

  protected readonly breadcrumbItems: MenuItem[] = [
    { label: this.translate.instant('ACTIVITIES.BREADCRUMB.LIST'), routerLink: '/activities' },
    {
      label: this.translate.instant(
        this.isEditMode() ? 'ACTIVITIES.BREADCRUMB.EDIT' : 'ACTIVITIES.BREADCRUMB.NEW',
      ),
    },
  ];

  protected readonly form: FormGroup<ActivityForm> = this.fb.group({
    titre: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required]],
    dateHeure: [null as Date | null, [Validators.required]],
    adresse: ['', [Validators.required]],
    points: [0, [Validators.required]],
    requiresRegistration: [true, [Validators.required]],
    requiresAttendanceValidation: [true, [Validators.required]],
  });

  protected readonly pageTitleKey = computed(() =>
    this.isEditMode() ? 'ACTIVITIES.BREADCRUMB.EDIT' : 'ACTIVITIES.BREADCRUMB.NEW',
  );

  protected readonly submitLabelKey = computed(() =>
    this.isEditMode() ? 'ACTIONS.UPDATE' : 'ACTIONS.SUBMIT',
  );

  ngOnInit(): void {
    this.loadActivityForEdit();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.form.getRawValue() as ActivityFormValue;
    const request = toActivityDtoRequest(formValue);

    const request$ =
      this.isEditMode() && this.activityId()
        ? this.activitiesRepository.updateActivity(this.activityId(), request)
        : this.activitiesRepository.addActivity(request);

    request$
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((activity: ActivityDto) => {
        void this.router.navigate(['/activities', activity.id]);
      });
  }

  protected onCancel(): void {
    void this.router.navigate(['/activities', this.activityId()]);
  }

  private loadActivityForEdit(): void {
    if (!this.activityId()) {
      return;
    }

    this.isLoading.set(true);

    this.activitiesRepository
      .getActivityById(this.activityId())
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((activity: ActivityDto) => {
        this.form.patchValue({
          titre: activity.title,
          description: activity.description ?? '',
          dateHeure: activity.datetime,
          adresse: activity.location ?? '',
          points: activity.points,
          requiresRegistration: activity.requiresRegistration ?? true,
          requiresAttendanceValidation: activity.requiresAttendanceValidation ?? true,
        });
      });
  }
}
