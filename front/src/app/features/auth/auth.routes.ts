import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const authRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { title: 'Connexion' },
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        data: { title: 'Mot de passe oublié' },
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
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
