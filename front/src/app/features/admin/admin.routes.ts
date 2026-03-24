import { Routes } from '@angular/router'

export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/admin-users.component').then(m => m.AdminUsersComponent)
  },
]