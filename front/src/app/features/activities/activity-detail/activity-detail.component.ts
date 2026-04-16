import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filter, finalize, map, switchMap } from 'rxjs';
import { ActivitiesRepository } from '../../../repositories/activities/activities.repository';
import { RegistersRepository } from '../../../repositories/registers/registers.repository';

@Component({
  selector: 'app-activity-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.css'
})
export class ActivityDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly registersRepository = inject(RegistersRepository);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);
  private readonly registrationRefresh = signal(0);

  protected readonly activityId = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('activityId')),
      map((value) => value ?? '')
    ),
    { initialValue: '' }
  );

  protected readonly activity = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('activityId')),
      filter((activityId): activityId is string => activityId !== null && activityId.length > 0),
      switchMap((activityId) => this.activitiesRepository.getActivityById(activityId))
    ),
    { initialValue: null }
  );

  protected onRegister(): void {
    const currentActivityId = this.activityId();
    if (!currentActivityId || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.registersRepository
      .register(currentActivityId)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.registrationRefresh.update((value) => value + 1);
      });
  }

  protected onUnregister(): void {
    const currentActivityId = this.activityId();
    if (!currentActivityId || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.registersRepository
      .unregister(currentActivityId)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.registrationRefresh.update((value) => value + 1);
      });
  }
}
