import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { finalize } from 'rxjs';
import { OptionalLabelDirective } from '../../../directives/optional-label.directive';
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
    ButtonModule,
    TranslatePipe,
    OptionalLabelDirective,
    BreadcrumbModule,
  ],
  templateUrl: './activity-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  private isLoading = signal(false);

  protected readonly breadcrumbItems: MenuItem[] = [
    { label: this.translate.instant('ACTIVITIES.BREADCRUMB.LIST'), routerLink: '/activities' },
    { label: this.translate.instant('ACTIVITIES.BREADCRUMB.NEW') },
  ];

  protected readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  protected readonly form: FormGroup<ActivityForm> = this.fb.group({
    titre: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    date: [null as Date | null, [Validators.required]],
    heure: ['', [Validators.required]],
    adresse: [''],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const formValue = this.form.getRawValue() as ActivityFormValue;
    const request = toActivityDtoRequest(formValue);

    this.activitiesRepository.addActivity(request).pipe(
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((activiy: ActivityDto) => {
        this.router.navigate(['/activities', activiy.id])
    });
  }
}
