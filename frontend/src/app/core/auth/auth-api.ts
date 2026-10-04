import { InjectionToken, type Signal } from '@angular/core';
import type { Observable } from 'rxjs';

import type { Credenciales, Usuario } from '../../shared/models/usuario.model';

/**
 * Contrato de autenticación. La implementación de desarrollo vive en memoria.
 * Para pasar al backend NestJS se reemplaza el proveedor de `AUTH_API`.
 */
export interface AuthApi {
  readonly usuario: Signal<Usuario | null>;
  readonly autenticado: Signal<boolean>;
  login(credenciales: Credenciales): Observable<Usuario>;
  logout(): void;
  /** Access token actual, o null si no hay sesión. El interceptor lo manda como Bearer. */
  token(): string | null;
}

export const AUTH_API = new InjectionToken<AuthApi>('AUTH_API');

export class CredencialesInvalidasError extends Error {
  constructor() {
    super('El correo o la contraseña no coinciden.');
    this.name = 'CredencialesInvalidasError';
  }
}
