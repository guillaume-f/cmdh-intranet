import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { MultiSelect } from 'primeng/multiselect';
import { BehaviorSubject, combineLatest, filter, finalize, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserDto } from '../../../../core/auth/user.model';
import { ActivitiesRepository } from '../../../../repositories/activities/activities.repository';
import { ActivityAttendanceDto } from '../../../../repositories/activities/activity-participant.model';
import { UsersRepository } from '../../../../repositories/users/users.repository';

@Component({
  selector: 'app-activity-attendance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ButtonDirective, MultiSelect, ReactiveFormsModule],
  templateUrl: './activity-attendance.component.html',
})
export class ActivityAttendanceComponent {
  private readonly activitiesRepository = inject(ActivitiesRepository);
  private readonly usersRepository = inject(UsersRepository);
  private readonly authService = inject(AuthService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly activityId = input.required<string>();
  readonly canValidateAttendance = input(false);

  protected canDeleteRegistration = signal(this.authService.can('registration:delete'));

  protected readonly isSubmitting = signal(false);
  protected readonly selectedUsersToAddControl = new FormControl<UserDto[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });

  private readonly refreshSource = new BehaviorSubject<void>(void 0);

  protected readonly participants = toSignal(
    combineLatest([toObservable(this.activityId), this.refreshSource.asObservable()]).pipe(
      map(([activityId]) => activityId),
      filter((activityId) => !!activityId),
      switchMap((activityId) => this.activitiesRepository.getActivityParticipants(activityId)),
    ),
    { initialValue: [] as ActivityAttendanceDto[] },
  );

  private readonly allUsers = toSignal(
    toObservable(this.canValidateAttendance).pipe(
      switchMap((canValidateAttendance) =>
        canValidateAttendance ? this.usersRepository.getAllUsers() : of([] as UserDto[]),
      ),
    ),
    { initialValue: [] as UserDto[] },
  );

  protected readonly availableUsersToAdd = () => {
    const participantIds = this.participants().map((p) => p.userId);
    return this.allUsers().filter(
      (u) => ['admin', 'member', 'encoder'].includes(u.role) && !participantIds.includes(u.id),
    );
  };

  protected onValidatePresence(userId: string, isPresent: boolean): void {
    if (!this.activityId() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);

    this.activitiesRepository
      .validateParticipantPresence(this.activityId(), userId, isPresent)
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.refreshSource.next();
      });
  }

  protected onAddParticipantsWithPresence(): void {
    const selected = this.selectedUsersToAddControl.value;
    if (!this.activityId() || this.isSubmitting() || this.selectedUsersToAddControl.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    this.activitiesRepository
      .addParticipantsWithPresence(
        this.activityId(),
        selected.map((u) => u.id),
      )
      .pipe(
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.selectedUsersToAddControl.setValue([]);
        this.refreshSource.next();
      });
  }

  protected onDeleteParticipantRegistration(userId: string): void {
    if (!this.activityId() || this.isSubmitting()) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmer la suppression',
      message: 'Voulez-vous vraiment supprimer cette inscription ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.isSubmitting.set(true);

        this.activitiesRepository
          .deleteParticipantRegistration(this.activityId(), userId)
          .pipe(
            finalize(() => this.isSubmitting.set(false)),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe(() => {
            this.refreshSource.next();
          });
      },
    });
  }
}
