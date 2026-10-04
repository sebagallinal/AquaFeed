import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';

import type { Credenciales, Usuario } from '../../shared/models/usuario.model';
import { AuthApi, CredencialesInvalidasError } from './auth-api';
import { CLAVE_SESION, type SesionGuardada } from './token-mock';

/** Autenticación contra el backend: `POST /api/v1/auth/login` devuelve el JWT y el usuario. */
@Injectable()
export class HttpAuthService implements AuthApi {
  private readonly http = inject(HttpClient);
  private readonly sesion = signal<SesionGuardada | null>(this.leer());

  readonly usuario = computed(() => this.sesion()?.usuario ?? null);
  readonly autenticado = computed(() => this.usuario() !== null);

  login(credenciales: Credenciales): Observable<Usuario> {
    return this.http.post<SesionGuardada>('/api/v1/auth/login', credenciales).pipe(
      tap((sesion) => this.guardar(sesion)),
      map((sesion) => sesion.usuario),
      catchError((error: unknown) =>
        throwError(() =>
          error instanceof HttpErrorResponse && error.status === 401
            ? new CredencialesInvalidasError()
            : new Error('No pudimos conectar con el servidor. Probá de nuevo en un rato.'),
        ),
      ),
    );
  }

  logout(): void {
    this.sesion.set(null);
    this.almacenamiento()?.removeItem(CLAVE_SESION);
  }

  token(): string | null {
    return this.sesion()?.token ?? null;
  }

  private guardar(sesion: SesionGuardada): void {
    this.sesion.set(sesion);
    this.almacenamiento()?.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  private leer(): SesionGuardada | null {
    const crudo = this.almacenamiento()?.getItem(CLAVE_SESION);
    if (!crudo) {
      return null;
    }
    try {
      const sesion = JSON.parse(crudo) as SesionGuardada;
      if (vencimiento(sesion.token) > Date.now() / 1000 && sesion.usuario?.id) {
        return sesion;
      }
    } catch {
      // Sesión ilegible: se descarta abajo.
    }
    this.almacenamiento()?.removeItem(CLAVE_SESION);
    return null;
  }

  private almacenamiento(): Storage | null {
    try {
      return globalThis.sessionStorage;
    } catch {
      return null;
    }
  }
}

/** `exp` del JWT en epoch segundos. La firma la valida el backend en cada pedido. */
function vencimiento(token: string): number {
  const payload = token.split('.')[1] ?? '';
  const data = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
  return data.exp ?? 0;
}
