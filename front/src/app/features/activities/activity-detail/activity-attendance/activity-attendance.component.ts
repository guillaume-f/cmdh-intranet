import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ButtonDirective } from 'primeng/button';
import { BehaviorSubject, combineLatest, filter, finalize, map, switchMap } from 'rxjs';
import { ActivitiesRepository } from '../../../../repositories/activities/activities.repository';
import { ActivityAttendanceDto } from '../../../../repositories/activities/activity-participant.model';

@Component({
  selector: 'app-activity-attendance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ButtonDirective],
  templateUrl: './activity-attendance.component.html',
})
export class ActivityAttendanceComponent {
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly destroyRef = inject(DestroyRef);

  readonly activityId = input.required<string>();
  readonly canValidateAttendance = input(false);

  protected readonly isSubmitting = signal(false);

  private readonly refreshSource = new BehaviorSubject<void>(void 0);

  protected readonly participants = toSignal(
    combineLatest([
      toObservable(this.activityId),
      this.refreshSource.asObservable(),
    ]).pipe(
      map(([activityId]) => activityId),
      filter((activityId) => !!activityId),
      switchMap((activityId) => this.activitiesRepository.getActivityParticipants(activityId))
    ),
    { initialValue: [] as ActivityAttendanceDto[] }
  );

  protected onValidatePresence(userId: string, isPresent: boolean): void {
    if (!this.activityId() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.activitiesRepository
      .validateParticipantPresence(this.activityId(), userId, isPresent)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.refreshSource.next();
      });
  }
}