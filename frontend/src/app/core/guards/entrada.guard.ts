import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { AUTH_API } from '../auth/auth-api';
import { rutaPorRol } from '../auth/destino';

/** `/` manda al panel del rol, o al login si no hay sesión. */
export const entradaGuard: CanActivateFn = () => {
  const auth = inject(AUTH_API);
  const usuario = auth.usuario();
  const destino = usuario ? rutaPorRol(usuario.rol) : '/login';
  return inject(Router).createUrlTree([destino]);
};
