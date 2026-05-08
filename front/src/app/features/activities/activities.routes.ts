// src/app/features/activities/activities.routes.ts
import { Routes } from '@angular/router'
import { permissionsGuard } from '../../core/auth/permissions.guard'

export const  activitiesRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionsGuard],
    data: {
      permissions: ['activity:read']
    },
    loadComponent: () => import('./activity-list/activity-list.component').then(m => m.ActivityListComponent),
  },
  {
    path: 'new',
    canActivate: [permissionsGuard],
    data: {
      permissions: ['activity:create']
    },
    loadComponent: () => import('./activity-form/activity-form.component').then(m => m.ActivityFormComponent),
  },
  {
    path: ':activityId',
    canActivate: [permissionsGuard],
    data: {
      permissions: ['activity:read']
    },
    loadComponent: () => import('./activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent),
  }
]