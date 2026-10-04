import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { AUTH_API } from '../auth/auth-api';
import { rutaPorRol } from '../auth/destino';
import type { Rol } from '../../shared/models/usuario.model';

export function roleGuard(rol: Rol): CanActivateFn {
  return () => {
    const auth = inject(AUTH_API);
    const router = inject(Router);
    const usuario = auth.usuario();
    if (!usuario) {
      return router.createUrlTree(['/login']);
    }
    if (usuario.rol === rol) {
      return true;
    }
    return router.createUrlTree([rutaPorRol(usuario.rol)]);
  };
}
