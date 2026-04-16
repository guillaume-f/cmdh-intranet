// src/app/features/activities/activities.routes.ts
import { Routes } from '@angular/router'

export const  activitiesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./activity-list/activity-list.component').then(m => m.ActivityListComponent),
  },
  {
    path: ':activityId',
    loadComponent: () => import('./activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent),
  }
]