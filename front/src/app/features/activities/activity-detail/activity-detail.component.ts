import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, finalize, map, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivitiesRepository } from '../../../repositories/activities/activities.repository';

@Component({
  selector: 'app-activity-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.css'
})
export class ActivityDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isSubmitting = signal(false);

  private readonly refreshDataSource = new BehaviorSubject<void>(void 0);
  private readonly refreshData$ = this.refreshDataSource.asObservable();
  
  protected readonly activityId = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('activityId')),
      map((value) => value ?? ''),
      tap(() => this.refreshDataSource.next())
    ),
    { initialValue: '' }
  );

  protected readonly activity = toSignal(
    this.refreshData$.pipe(
      switchMap(() => this.activitiesRepository.getActivityById(this.activityId()))
    ),
    { initialValue: null }
  );

  protected canRegister = signal(this.authService.can('registration:create'));

  protected onRegister(): void {
    if (!this.activityId() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.activitiesRepository
      .register(this.activityId())
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.refreshDataSource.next();
      });
  }

  protected onUnregister(): void {
    if (!this.activityId() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.activitiesRepository
      .unregister(this.activityId())
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.refreshDataSource.next();
      });
  }
}
