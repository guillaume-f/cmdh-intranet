import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { ActivitiesRepository } from '../../../repositories/activities/activities.repository';

@Component({
  selector: 'app-activity-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.css'
})
export class ActivityDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly activitiesRepository = inject(ActivitiesRepository);

  protected readonly activity = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('activityId')),
      filter((activityId): activityId is string => activityId !== null && activityId.length > 0),
      switchMap((activityId) => this.activitiesRepository.getActivityById(activityId))
    ),
    { initialValue: null }
  );
}
