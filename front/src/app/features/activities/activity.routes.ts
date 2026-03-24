import { Routes } from '@angular/router'
import { roleGuard } from '../../core/guards/role.guard'

export const ACTIVITY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/activity-list/activity-list.component').then(m => m.ActivityListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/activity-detail/activity-detail.component').then(m => m.ActivityDetailComponent)
  },
  {
    // Créer une activité — encoder minimum
    path: 'new',
    canActivate: [roleGuard],
    data: { minRole: 'encoder' },
    loadComponent: () => import('./pages/activity-form/activity-form.component').then(m => m.ActivityFormComponent)
  },
  {
    // Éditer — encoder minimum
    path: ':id/edit',
    canActivate: [roleGuard],
    data: { minRole: 'encoder' },
    loadComponent: () => import('./pages/activity-form/activity-form.component').then(m => m.ActivityFormComponent)
  },
  {
    // Voir les participants — encoder minimum
    path: ':id/participants',
    canActivate: [roleGuard],
    data: { minRole: 'encoder' },
    loadComponent: () => import('./pages/activity-participants/activity-participants.component').then(m => m.ActivityParticipantsComponent)
  },
]
