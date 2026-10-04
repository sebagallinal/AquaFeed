import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AUTH_API } from '../auth/auth-api';

/** Adjunta el access token. Cuando exista el refresh, este es el lugar para reintentar un 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AUTH_API).token();
  if (!token || req.headers.has('Authorization')) {
    return next(req);
  }
  return next(
    req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
