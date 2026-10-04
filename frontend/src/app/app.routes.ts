import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { entradaGuard } from './core/guards/entrada.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [entradaGuard],
    loadComponent: () =>
      import('./features/errores/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./features/usuario/shell/user-shell').then((m) => m.UserShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: { titulo: 'Mis peceras' },
        loadComponent: () => import('./features/usuario/panel/panel').then((m) => m.Panel),
      },
      {
        path: 'dispositivos/:id',
        data: { titulo: 'Pecera' },
        loadComponent: () => import('./features/usuario/pecera/pecera').then((m) => m.Pecera),
      },
      {
        path: 'dispositivos/:id/horarios',
        data: { titulo: 'Horarios' },
        loadComponent: () => import('./features/usuario/horarios/horarios').then((m) => m.Horarios),
      },
      {
        path: 'alertas',
        data: { titulo: 'Alertas' },
        loadComponent: () => import('./features/usuario/alertas/alertas').then((m) => m.Alertas),
      },
      {
        path: 'especies',
        data: { titulo: 'Especies' },
        loadComponent: () => import('./features/usuario/especies/especies').then((m) => m.Especies),
      },
      {
        path: 'especies/:slug',
        data: { titulo: 'Especie' },
        loadComponent: () => import('./features/usuario/especies/especie').then((m) => m.Especie),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    loadComponent: () => import('./features/admin/shell/admin-shell').then((m) => m.AdminShell),
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: { titulo: 'Consola' },
        loadComponent: () =>
          import('./features/admin/resumen/resumen').then((m) => m.ResumenAdminPage),
      },
      {
        path: 'usuarios',
        data: { titulo: 'Usuarios' },
        loadComponent: () =>
          import('./features/admin/usuarios/usuarios').then((m) => m.UsuariosAdmin),
      },
      {
        path: 'usuarios/:id',
        data: { titulo: 'Usuario' },
        loadComponent: () =>
          import('./features/admin/usuarios/usuario').then((m) => m.UsuarioAdmin),
      },
      {
        path: 'dispositivos',
        data: { titulo: 'Dispositivos' },
        loadComponent: () =>
          import('./features/admin/dispositivos/dispositivos').then((m) => m.DispositivosAdmin),
      },
      {
        path: 'dispositivos/:id',
        data: { titulo: 'Dispositivo' },
        loadComponent: () =>
          import('./features/admin/dispositivos/dispositivo').then((m) => m.DispositivoAdminPage),
      },
      {
        path: 'especies',
        data: { titulo: 'Perfiles de especie' },
        loadComponent: () =>
          import('./features/admin/especies/especies').then((m) => m.EspeciesAdmin),
      },
      {
        path: 'especies/:id',
        data: { titulo: 'Perfil de especie' },
        loadComponent: () =>
          import('./features/admin/especies/especie').then((m) => m.EspecieAdmin),
      },
      {
        path: 'alertas',
        data: { titulo: 'Alertas y salud' },
        loadComponent: () => import('./features/admin/alertas/alertas').then((m) => m.AlertasAdmin),
      },
    ],
  },
  {
    path: '**',
    data: { titulo: 'Página no encontrada' },
    loadComponent: () =>
      import('./features/errores/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
];
