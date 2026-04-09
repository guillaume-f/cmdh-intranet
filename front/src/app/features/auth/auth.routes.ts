import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',    
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
        data: { title: 'Connexion' },
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
        data: { title: 'Mot de passe oublié' },
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
        data: { title: 'Réinitialiser le mot de passe' },
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
