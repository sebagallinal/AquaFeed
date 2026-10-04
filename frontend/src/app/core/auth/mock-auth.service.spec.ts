import { CredencialesInvalidasError } from './auth-api';
import { MockAuthService } from './mock-auth.service';
import { CLAVE_SESION, emitirTokenMock } from './token-mock';
import type { Usuario } from '../../shared/models/usuario.model';

const NAHUEL: Usuario = {
  id: 'usr-nahuel',
  nombre: 'Nahuel Mota',
  email: 'nahuel.mota@correo.com',
  rol: 'user',
  activo: true,
};

describe('MockAuthService', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('inicia sesión con las credenciales de desarrollo y guarda el token', () => {
    const auth = new MockAuthService();
    let email = '';
    auth
      .login({ email: '  Nahuel.Mota@Correo.com ', password: '12341234' })
      .subscribe((usuario) => {
        email = usuario.email;
      });

    expect(email).toBe('nahuel.mota@correo.com');
    expect(auth.autenticado()).toBe(true);
    expect(auth.usuario()?.rol).toBe('user');
    expect(auth.token()?.startsWith('mock.')).toBe(true);
    expect(auth.token()?.endsWith('.dev')).toBe(true);
    expect(sessionStorage.getItem(CLAVE_SESION)).toContain('nahuel.mota@correo.com');
  });

  it('rechaza una contraseña incorrecta y no deja sesión', () => {
    const auth = new MockAuthService();
    let fallo = false;
    auth.login({ email: 'nahuel.mota@correo.com', password: 'no-es-la-clave' }).subscribe({
      error: (error: unknown) => {
        fallo = error instanceof CredencialesInvalidasError;
      },
    });

    expect(fallo).toBe(true);
    expect(auth.autenticado()).toBe(false);
    expect(auth.token()).toBeNull();
    expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  it('cierra la sesión', () => {
    const auth = new MockAuthService();
    auth.login({ email: 'equipo@correo.com', password: '12341234' }).subscribe();
    auth.logout();

    expect(auth.usuario()).toBeNull();
    expect(auth.token()).toBeNull();
    expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  it('restaura una sesión válida y descarta una vencida o rota', () => {
    const viva = new MockAuthService();
    viva.login({ email: 'nahuel.mota@correo.com', password: '12341234' }).subscribe();
    const restaurada = new MockAuthService();
    expect(restaurada.usuario()?.nombre).toBe('Nahuel Mota');
    expect(restaurada.token()).toBe(viva.token());

    const vencida = emitirTokenMock(NAHUEL, Math.floor(Date.now() / 1000) - 30);
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify({ token: vencida, usuario: NAHUEL }));
    expect(new MockAuthService().autenticado()).toBe(false);
    expect(sessionStorage.getItem(CLAVE_SESION)).toBeNull();

    sessionStorage.setItem(CLAVE_SESION, '{');
    expect(new MockAuthService().autenticado()).toBe(false);
  });
});
