import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import Nora from '@primeuix/themes/nora';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    providePrimeNG({
            theme: {
                preset: Nora,
                 options: {
                cssLayer: {
                    name: 'primeng',
                    order: 'theme, base, primeng'
                }
            }
            }
        })
  ]
};
