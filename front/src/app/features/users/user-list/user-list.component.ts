import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UserDto } from '../../../core/auth/user.model';
import { UsersRepository } from '../../../repositories/users/users.repository';

@Component({
  selector: 'app-user-list.component',
  imports: [RouterLink],
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  private readonly usersRepository = inject(UsersRepository);

  protected readonly users: Signal<UserDto[] | null> = toSignal(this.usersRepository.getAllUsers(), {
    initialValue: null
  });
}
