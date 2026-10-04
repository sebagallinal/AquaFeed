import type { Rol, Usuario } from '../../shared/models/usuario.model';

export const CLAVE_SESION = 'aquafeed.sesion.v1';

export interface PayloadToken {
  sub: string;
  email: string;
  role: Rol;
  name: string;
  exp: number;
}

export interface SesionGuardada {
  token: string;
  usuario: Usuario;
}

/** Token falso, sin firma. El backend real va a emitir un JWT de verdad. */
export function emitirTokenMock(usuario: Usuario, expEpoch = dentroDeOchoHoras()): string {
  const payload: PayloadToken = {
    sub: usuario.id,
    email: usuario.email,
    role: usuario.rol,
    name: usuario.nombre,
    exp: expEpoch,
  };
  return `mock.${aBase64Url(JSON.stringify(payload))}.dev`;
}

export function leerPayloadMock(token: string): PayloadToken | null {
  const partes = token.split('.');
  if (partes.length !== 3 || partes[0] !== 'mock' || partes[2] !== 'dev') {
    return null;
  }
  try {
    const data: unknown = JSON.parse(deBase64Url(partes[1]));
    if (!esPayload(data)) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function sesionValida(
  sesion: SesionGuardada,
  ahoraEpoch = Math.floor(Date.now() / 1000),
): boolean {
  const payload = leerPayloadMock(sesion.token);
  if (!payload) {
    return false;
  }
  return (
    payload.exp > ahoraEpoch &&
    payload.sub === sesion.usuario.id &&
    payload.role === sesion.usuario.rol &&
    payload.email === sesion.usuario.email
  );
}

function dentroDeOchoHoras(): number {
  return Math.floor(Date.now() / 1000) + 8 * 60 * 60;
}

function esPayload(valor: unknown): valor is PayloadToken {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const candidato = valor as Record<string, unknown>;
  return (
    typeof candidato['sub'] === 'string' &&
    typeof candidato['email'] === 'string' &&
    (candidato['role'] === 'admin' || candidato['role'] === 'user') &&
    typeof candidato['name'] === 'string' &&
    typeof candidato['exp'] === 'number'
  );
}

function aBase64Url(valor: string): string {
  const bytes = new TextEncoder().encode(valor);
  let binario = '';
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte);
  });
  return btoa(binario).replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function deBase64Url(valor: string): string {
  const resto = valor.length % 4;
  const conPadding = resto === 0 ? valor : valor + '='.repeat(4 - resto);
  const binario = atob(conPadding.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(binario, (caracter) => caracter.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
