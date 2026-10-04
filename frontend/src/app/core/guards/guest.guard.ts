import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { AUTH_API } from '../auth/auth-api';
import { rutaPorRol } from '../auth/destino';

/** El login solo lo ven quienes todavía no tienen sesión. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AUTH_API);
  const usuario = auth.usuario();
  if (!usuario) {
    return true;
  }
  return inject(Router).createUrlTree([rutaPorRol(usuario.rol)]);
};
