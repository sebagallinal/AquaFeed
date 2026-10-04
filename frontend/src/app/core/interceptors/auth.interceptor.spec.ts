import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import type { Usuario } from '../../shared/models/usuario.model';
import { AUTH_API, type AuthApi } from '../auth/auth-api';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  const persona: Usuario = {
    id: 'usr-nahuel',
    nombre: 'Nahuel Mota',
    email: 'nahuel.mota@correo.com',
    rol: 'user',
    activo: true,
  };

  function authCon(token: string | null): AuthApi {
    return {
      usuario: signal(token ? persona : null).asReadonly(),
      autenticado: computed(() => token !== null),
      login: () => of(persona),
      logout: () => undefined,
      token: () => token,
    };
  }

  function preparar(token: string | null): HttpTestingController {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AUTH_API, useValue: authCon(token) },
      ],
    });
    return TestBed.inject(HttpTestingController);
  }

  it('adjunta el bearer si hay token', () => {
    const control = preparar('mock.abc.dev');
    TestBed.inject(HttpClient).get('/api/v1/devices').subscribe();
    const req = control.expectOne('/api/v1/devices');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock.abc.dev');
    req.flush({});
    control.verify();
  });

  it('no pisa un Authorization que ya vino en el request', () => {
    const control = preparar('mock.abc.dev');
    TestBed.inject(HttpClient)
      .get('/api/v1/devices', { headers: { Authorization: 'Bearer otro' } })
      .subscribe();
    const req = control.expectOne('/api/v1/devices');
    expect(req.request.headers.get('Authorization')).toBe('Bearer otro');
    req.flush({});
  });

  it('sigue sin header si no hay sesión', () => {
    const control = preparar(null);
    TestBed.inject(HttpClient).get('/api/v1/health').subscribe();
    const req = control.expectOne('/api/v1/health');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
