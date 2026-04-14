// src/app/features/activities/activity.routes.ts
import { Routes } from '@angular/router'

export const  activitiesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./activity-list/activity-list.component').then(m => m.ActivityListComponent),
  }
]