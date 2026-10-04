import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { AUTH_API } from '../auth/auth-api';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AUTH_API);
  if (auth.autenticado()) {
    return true;
  }
  const router = inject(Router);
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
