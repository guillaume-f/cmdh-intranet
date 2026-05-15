import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonDirective } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BehaviorSubject, filter, finalize, map, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivitiesRepository } from '../../../repositories/activities/activities.repository';

@Component({
  selector: 'app-activity-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BreadcrumbModule, ConfirmDialogModule, DatePipe, ButtonDirective],
  templateUrl: './activity-detail.component.html',
  providers: [ConfirmationService],
})
export class ActivityDetailComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  protected readonly isSubmitting = signal(false);

  private readonly refreshDataSource = new BehaviorSubject<void>(void 0);
  private readonly refreshData$ = this.refreshDataSource.asObservable();
  
  protected readonly activityId = toSignal(
    this.activatedRoute.paramMap.pipe(
      map((params) => params.get('activityId')),
      map((value) => value ?? ''),
      tap(() => this.refreshDataSource.next())
    ),
    { initialValue: '' }
  );

  protected readonly breadcrumbItems = computed<MenuItem[]>(() => [
    { label: this.translateService.instant('ACTIVITIES.BREADCRUMB.LIST'), routerLink: '/activities' },
    { label: this.activity()?.title  },
  ]);

  protected readonly activity = toSignal(
    this.refreshData$.pipe(
      filter(() => !!this.activityId()),
      switchMap(() => {
        return this.activitiesRepository.getActivityById(this.activityId());
      })
    ),
    { initialValue: null }
  );

  protected readonly participants = toSignal(
    this.refreshData$.pipe(  filter(() => !!this.activityId()),
      switchMap(() => {
        return this.activitiesRepository.getActivityParticipants(this.activityId());
      })
    ),
    { initialValue: [] }
  );

  protected canRegister = signal(this.authService.can('registration:create'));
  protected canDelete = signal(this.authService.can('activity:delete'));
  protected canEdit = signal(this.authService.can('activity:edit'));
  protected canValidateAttendance = signal(this.authService.can('attendance:validate'));

  protected readonly isFutureActivity = computed(() => {
    const activity = this.activity();
    if (!activity) return false;
    return dayjs(activity.datetime).isAfter(dayjs(), 'day') || dayjs(activity.datetime).isSame(dayjs(), 'day');
  });

  protected readonly canEditActivity = computed(() => this.canEdit() && this.isFutureActivity());
  protected readonly canDeleteActivity = computed(() => this.canDelete() && this.isFutureActivity());
  private readonly isAttendanceValidationAvailable = computed(() => {
    const activity = this.activity();
    if (!activity) return false;
    return activity.requiresAttendanceValidation && dayjs(activity.datetime).isBefore(dayjs(), 'day');
  });
  protected readonly canValidateAttendanceForActivity = computed(() =>
    this.canValidateAttendance() && this.isAttendanceValidationAvailable()
  );

  protected onEdit(): void {
    if (!this.activityId()) {
      return;
    }

    void this.router.navigate(['/activities', this.activityId(), 'edit']);
  }

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

  protected onDelete(): void {
    if (!this.activityId() || this.isSubmitting()) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmer la suppression',
      message: 'Voulez-vous vraiment supprimer cette activite ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteActivity(),
    });
  }

  private deleteActivity(): void {
    if (!this.activityId() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.activitiesRepository
      .deleteActivity(this.activityId())
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        void this.router.navigate(['/activities']);
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
        this.refreshDataSource.next();
      });
  }
}
