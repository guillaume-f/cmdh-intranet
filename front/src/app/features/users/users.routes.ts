// src/app/features/activities/activities.routes.ts
import { Routes } from '@angular/router'
import { permissionsGuard } from '../../core/auth/permissions.guard'

export const  usersRoutes: Routes = [
  {
    path: '',
    canActivate: [permissionsGuard],
    data: {
      permissions: ['user:manage']
    },
    loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent),
  },
  {
    path: 'new',
    canActivate: [permissionsGuard],
    data: {
      permissions: ['user:manage']
    },
    loadComponent: () => import('./user-edit/user-edit.component').then(m => m.UserEditComponent),
  },
  {
    path: ':userId/edit',
    canActivate: [permissionsGuard],
    data: {
      permissions: ['user:manage']
    },
    loadComponent: () => import('./user-edit/user-edit.component').then(m => m.UserEditComponent),
  },
  {
    path: ':userId',
    canActivate: [permissionsGuard],
    data: {
      permissions: ['user:manage']
    },
    loadComponent: () => import('./user-detail/user-detail.component').then(m => m.UserDetailComponent),
  }
]