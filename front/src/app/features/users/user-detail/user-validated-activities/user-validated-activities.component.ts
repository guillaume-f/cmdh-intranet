import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { filter, switchMap } from 'rxjs';
import { UsersRepository } from '../../../../repositories/users/users.repository';

@Component({
  selector: 'app-user-validated-activities',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink, TableModule],
  templateUrl: './user-validated-activities.component.html',
})
export class UserValidatedActivitiesComponent {
  private readonly usersRepository = inject(UsersRepository);

  readonly userId = input.required<string>();

  protected readonly validatedActivities = toSignal(
    toObservable(this.userId).pipe(
      filter((userId) => !!userId),
      switchMap((userId) => this.usersRepository.getValidatedActivitiesByUserId(userId))
    ),
    { initialValue: null }
  );
}