import { computed, Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import type { Credenciales, Usuario } from '../../shared/models/usuario.model';
import { AuthApi, ClaveInvalidaError, CredencialesInvalidasError } from './auth-api';
import { CLAVE_SESION, emitirTokenMock, type SesionGuardada, sesionValida } from './token-mock';

interface CuentaDemo extends Usuario {
  password: string;
}

/**
 * Usuarios fijos de desarrollo. No son cuentas reales.
 * Las mismas credenciales están en el README, marcadas como solo para desarrollo.
 */
const CLAVE_DEMO = '12341234';
/** Contraseñas que el usuario cambió en esta pestaña. La de demostración vuelve al cerrarla. */
const CLAVE_CLAVES = 'aquafeed.claves';

const CUENTAS: readonly CuentaDemo[] = [
  {
    id: 'usr-admin',
    nombre: 'Equipo AquaFeed',
    email: 'equipo@correo.com',
    rol: 'admin',
    activo: true,
    password: CLAVE_DEMO,
  },
  {
    id: 'usr-horacio',
    nombre: 'Horacio Vespoli',
    email: 'horacio.vespoli@correo.com',
    rol: 'user',
    activo: true,
    password: CLAVE_DEMO,
  },
  {
    id: 'usr-nahuel',
    nombre: 'Nahuel Mota',
    email: 'nahuel.mota@correo.com',
    rol: 'user',
    activo: true,
    password: CLAVE_DEMO,
  },
  {
    id: 'usr-sebastian',
    nombre: 'Sebastian Gallinal',
    email: 'sebastian.gallinal@correo.com',
    rol: 'user',
    activo: true,
    password: CLAVE_DEMO,
  },
];

@Injectable()
export class MockAuthService implements AuthApi {
  private readonly sesion = signal<SesionGuardada | null>(this.leer());
  private tokenActual: string | null = this.sesion()?.token ?? null;

  readonly usuario = computed(() => this.sesion()?.usuario ?? null);
  readonly autenticado = computed(() => this.usuario() !== null);

  login(credenciales: Credenciales): Observable<Usuario> {
    const email = credenciales.email.trim().toLowerCase();
    const cuenta = CUENTAS.find((item) => item.email === email && item.activo);
    if (!cuenta || this.claveDe(cuenta.id, cuenta.password) !== credenciales.password) {
      return throwError(() => new CredencialesInvalidasError());
    }
    const usuario = this.sinPassword(cuenta);
    const token = emitirTokenMock(usuario);
    this.guardar({ token, usuario });
    return of(usuario);
  }

  cambiarClave(passwordActual: string, password: string): Observable<void> {
    const sesion = this.usuario();
    const cuenta = CUENTAS.find((item) => item.id === sesion?.id);
    if (!sesion || !cuenta) {
      return throwError(() => new ClaveInvalidaError('Tenés que iniciar sesión.'));
    }
    if (this.claveDe(cuenta.id, cuenta.password) !== passwordActual) {
      return throwError(() => new ClaveInvalidaError('La contraseña actual no coincide.'));
    }
    if (password.length < 8 || password.length > 72) {
      return throwError(
        () => new ClaveInvalidaError('La contraseña tiene que tener entre 8 y 72 caracteres.'),
      );
    }
    if (password === passwordActual) {
      return throwError(
        () => new ClaveInvalidaError('La nueva contraseña tiene que ser distinta de la actual.'),
      );
    }
    const mapa = this.clavesGuardadas();
    mapa[cuenta.id] = password;
    this.almacenamiento()?.setItem(CLAVE_CLAVES, JSON.stringify(mapa));
    return of(undefined);
  }

  logout(): void {
    this.tokenActual = null;
    this.sesion.set(null);
    this.almacenamiento()?.removeItem(CLAVE_SESION);
  }

  token(): string | null {
    return this.tokenActual;
  }

  private sinPassword(cuenta: CuentaDemo): Usuario {
    return {
      id: cuenta.id,
      nombre: cuenta.nombre,
      email: cuenta.email,
      rol: cuenta.rol,
      activo: cuenta.activo,
    };
  }

  private guardar(sesion: SesionGuardada): void {
    this.tokenActual = sesion.token;
    this.sesion.set(sesion);
    this.almacenamiento()?.setItem(CLAVE_SESION, JSON.stringify(sesion));
  }

  private leer(): SesionGuardada | null {
    const crudo = this.almacenamiento()?.getItem(CLAVE_SESION);
    if (!crudo) {
      return null;
    }
    try {
      const data: unknown = JSON.parse(crudo);
      if (!esSesion(data) || !sesionValida(data)) {
        this.almacenamiento()?.removeItem(CLAVE_SESION);
        return null;
      }
      return data;
    } catch {
      this.almacenamiento()?.removeItem(CLAVE_SESION);
      return null;
    }
  }

  private claveDe(id: string, porDefecto: string): string {
    return this.clavesGuardadas()[id] ?? porDefecto;
  }

  private clavesGuardadas(): Record<string, string> {
    const crudo = this.almacenamiento()?.getItem(CLAVE_CLAVES);
    if (!crudo) {
      return {};
    }
    try {
      const data: unknown = JSON.parse(crudo);
      if (typeof data !== 'object' || data === null) {
        return {};
      }
      const mapa: Record<string, string> = {};
      for (const [id, clave] of Object.entries(data)) {
        if (typeof clave === 'string') {
          mapa[id] = clave;
        }
      }
      return mapa;
    } catch {
      return {};
    }
  }

  private almacenamiento(): Storage | null {
    try {
      return globalThis.sessionStorage;
    } catch {
      return null;
    }
  }
}

function esSesion(valor: unknown): valor is SesionGuardada {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const candidato = valor as Record<string, unknown>;
  const usuario = candidato['usuario'];
  if (typeof candidato['token'] !== 'string' || typeof usuario !== 'object' || usuario === null) {
    return false;
  }
  const persona = usuario as Record<string, unknown>;
  return (
    typeof persona['id'] === 'string' &&
    typeof persona['nombre'] === 'string' &&
    typeof persona['email'] === 'string' &&
    (persona['rol'] === 'admin' || persona['rol'] === 'user') &&
    typeof persona['activo'] === 'boolean'
  );
}
