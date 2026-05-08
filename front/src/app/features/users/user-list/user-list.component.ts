import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-list.component',
  imports: [],
  templateUrl: './user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent { }
