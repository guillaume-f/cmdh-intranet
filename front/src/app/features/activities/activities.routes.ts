// src/app/features/activities/activities.routes.ts
import { Routes } from '@angular/router'

export const  activitiesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./activity-list/activity-list.component').then(m => m.ActivityListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./activity-form/activity-form.component').then(m => m.ActivityFormComponent),
  },
  {
    path: ':activityId',
    loadComponent: () => import('./activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent),
  }
]