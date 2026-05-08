import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../core/auth/auth.service";
import { ActivitiesRepository } from "../../../repositories/activities/activities.repository";

@Component({
  selector: 'app-activity-list',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.css'
})
export class ActivityListComponent {
  private readonly activitiesRepository = inject(ActivitiesRepository)
  private readonly authService = inject(AuthService)

  protected readonly activities = toSignal(this.activitiesRepository.getAllActivities(), { initialValue: null })

  protected readonly canCreateActivity = signal(this.authService.can('activity:create'))
  
}