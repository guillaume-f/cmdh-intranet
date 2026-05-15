import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { UserRole } from '../../../core/auth/user-role.type';
import { UserDto } from '../../../core/auth/user.model';
import { UsersRepository } from '../../../repositories/users/users.repository';

@Component({
  selector: 'app-user-list.component',
  imports: [RouterLink, TagModule],
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  private readonly usersRepository = inject(UsersRepository);
  private readonly roleOrder: Record<UserRole, number> = {
    admin: 0,
    encoder: 1,
    member: 2,
    candidate: 3,
  };

  protected readonly users: Signal<UserDto[] | null> = toSignal(this.usersRepository.getAllUsers(), {
    initialValue: null
  });

  protected readonly sortedUsers = computed(() => {
    const users = this.users();

    if (users === null) {
      return null;
    }

    return [...users].sort((left, right) => this.roleOrder[left.role] - this.roleOrder[right.role]);
  });
}
