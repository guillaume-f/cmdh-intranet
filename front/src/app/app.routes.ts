import { Routes } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
    providers: [
      provideTranslateService({
        extend: true,
        loader: provideTranslateHttpLoader({
          prefix: '/assets/i18n/auth/',
          suffix: '.json',
        }),
      }),
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'activities',
        loadChildren: () =>
          import('./features/activities/activities.routes').then((m) => m.activitiesRoutes),
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes').then((m) => m.usersRoutes),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'activities',
      },
    ],
  },
];
