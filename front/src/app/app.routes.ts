import { Routes } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const routes: Routes = [
  {
    path: 'auth',loadChildren: () => import('./features/auth/auth.routes').then((m) => m.authRoutes),
    providers: [
      provideTranslateService({
        extend: true,
        loader: provideTranslateHttpLoader({
          prefix: '/assets/i18n/auth/',
          suffix: '.json'
        })
      })
    ],
    
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];
