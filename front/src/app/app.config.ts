import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import CMDHPreset from './theme.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: CMDHPreset,
      },
    }),
    provideTranslateService({
      defaultLanguage: 'fr',
      fallbackLang: 'fr',
      useDefaultLang: true,
      lang: 'fr',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      }),
     
    })
  ],
};
