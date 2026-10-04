import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, type Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { computed, signal } from '@angular/core';
import { of } from 'rxjs';

import { AUTH_API, type AuthApi } from '../auth/auth-api';
import type { Rol, Usuario } from '../../shared/models/usuario.model';
import { authGuard } from './auth.guard';
import { entradaGuard } from './entrada.guard';
import { guestGuard } from './guest.guard';
import { roleGuard } from './role.guard';

@Component({ selector: 'app-pagina-test', template: 'ok' })
class PaginaTest {}

describe('guards', () => {
  function usuario(rol: Rol): Usuario {
    return {
      id: rol === 'admin' ? 'usr-admin' : 'usr-nahuel',
      nombre: rol === 'admin' ? 'Equipo AquaFeed' : 'Nahuel Mota',
      email: rol === 'admin' ? 'equipo@correo.com' : 'nahuel.mota@correo.com',
      rol,
      activo: true,
    };
  }

  function auth(actual: Usuario | null): AuthApi {
    const sesion = signal(actual);
    return {
      usuario: sesion.asReadonly(),
      autenticado: computed(() => sesion() !== null),
      login: () => of(actual ?? usuario('user')),
      logout: () => sesion.set(null),
      token: () => (sesion() ? 'mock.token.dev' : null),
    };
  }

  async function ir(url: string, sesion: Usuario | null, rutas: Routes) {
    TestBed.configureTestingModule({
      providers: [provideRouter(rutas), { provide: AUTH_API, useValue: auth(sesion) }],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return TestBed.inject(Router).url;
  }

  it('authGuard manda al login si no hay sesión', async () => {
    const url = await ir('/app', null, [
      { path: 'login', component: PaginaTest },
      { path: 'app', canActivate: [authGuard], component: PaginaTest },
    ]);
    expect(url).toBe('/login?returnUrl=%2Fapp');
  });

  it('authGuard deja pasar con sesión', async () => {
    const url = await ir('/app', usuario('user'), [
      { path: 'login', component: PaginaTest },
      { path: 'app', canActivate: [authGuard], component: PaginaTest },
    ]);
    expect(url).toBe('/app');
  });

  it('guestGuard redirige al usuario logueado según su rol', async () => {
    const url = await ir('/login', usuario('admin'), [
      { path: 'login', canActivate: [guestGuard], component: PaginaTest },
      { path: 'admin', component: PaginaTest },
      { path: 'app', component: PaginaTest },
    ]);
    expect(url).toBe('/admin');
  });

  it('guestGuard deja el login si no hay sesión', async () => {
    const url = await ir('/login', null, [
      { path: 'login', canActivate: [guestGuard], component: PaginaTest },
    ]);
    expect(url).toBe('/login');
  });

  it('roleGuard saca al usuario de /admin', async () => {
    const url = await ir('/admin', usuario('user'), [
      { path: 'admin', canActivate: [roleGuard('admin')], component: PaginaTest },
      { path: 'app', component: PaginaTest },
    ]);
    expect(url).toBe('/app');
  });

  it('roleGuard deja entrar al admin', async () => {
    const url = await ir('/admin', usuario('admin'), [
      { path: 'admin', canActivate: [roleGuard('admin')], component: PaginaTest },
      { path: 'app', component: PaginaTest },
    ]);
    expect(url).toBe('/admin');
  });

  it('entradaGuard elige el inicio según la sesión', async () => {
    const url = await ir('/', usuario('user'), [
      { path: '', pathMatch: 'full', canActivate: [entradaGuard], component: PaginaTest },
      { path: 'app', component: PaginaTest },
      { path: 'login', component: PaginaTest },
    ]);
    expect(url).toBe('/app');
  });
});
