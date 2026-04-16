import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivitiesRepository } from "../../../repositories/activities/activities.repository";

@Component({
  selector: 'app-activity-list',
  standalone: true,
  templateUrl: './activity-list.component.html',
  styleUrl: './activity-list.component.css'
})
export class ActivityListComponent implements OnInit {
  private readonly activitiesRepository = inject(ActivitiesRepository)
  private readonly destroyRef = inject(DestroyRef)
  
  ngOnInit(): void {
   this.activitiesRepository.getAllActivities().pipe(
    takeUntilDestroyed(this.destroyRef)
   ).subscribe((d ) => console.log(d))
  }
}