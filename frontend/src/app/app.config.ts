import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeEsAr from '@angular/common/locales/es-AR';
import {
  ApplicationConfig,
  isDevMode,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { AUTH_API } from './core/auth/auth-api';
import { HttpAuthService } from './core/auth/http-auth.service';
import { MockAuthService } from './core/auth/mock-auth.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { DATOS_API } from './shared/data/datos-api';
import { HttpDatosService } from './shared/data/http-datos.service';
import { MockDatosService } from './shared/data/mock-datos.service';

registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-AR' },
    // En desarrollo (ng serve) los datos salen de memoria; el build de producción usa el backend.
    { provide: AUTH_API, useClass: isDevMode() ? MockAuthService : HttpAuthService },
    { provide: DATOS_API, useClass: isDevMode() ? MockDatosService : HttpDatosService },
  ],
};
