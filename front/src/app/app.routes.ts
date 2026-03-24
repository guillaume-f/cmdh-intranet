// src/app/app.routes.ts
import { Routes } from '@angular/router'
import { authGuard } from './core/guards/auth.guard'
import { guestGuard } from './core/guards/guest.guard'

export const routes: Routes = [
  // Redirect racine
  { path: '', redirectTo: 'activities', pathMatch: 'full' },

  // Pages auth (accessibles uniquement si non connecté)
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Layout principal (shell avec sidebar)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      // Activités — tous les rôles connectés
      {
        path: 'activities',
        loadChildren: () => import('./features/activities/activity.routes').then(m => m.ACTIVITY_ROUTES)
      },

      // Gestion users — admin uniquement
      // {
      //   path: 'admin',
      //   canActivate: [roleGuard],
      //   data: { minRole: 'admin' },
      //   loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      // },

      // Dashboard / page d'accueil après login
      // {
      //   path: 'dashboard',
      //   loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      // },
    ]
  },

  // Pages d'erreur
  // { path: '403', loadComponent: () => import('./shared/pages/forbidden/forbidden.component').then(m => m.ForbiddenComponent) },
  // { path: '**', loadComponent: () => import('./shared/pages/not-found/not-found.component').then(m => m.NotFoundComponent) },
]
