import type { Rol } from '../../shared/models/usuario.model';

export function rutaPorRol(rol: Rol): '/admin' | '/app' {
  return rol === 'admin' ? '/admin' : '/app';
}

/** Evita que el returnUrl del login mande a un sitio externo o a un área de otro rol. */
export function destinoSeguro(returnUrl: string | null, rol: Rol): string {
  const inicio = rutaPorRol(rol);
  if (returnUrl === null || !esRutaInterna(returnUrl)) {
    return inicio;
  }
  if (rol === 'admin' && (empiezaEn(returnUrl, '/admin') || empiezaEn(returnUrl, '/app'))) {
    return returnUrl;
  }
  if (rol === 'user' && empiezaEn(returnUrl, '/app')) {
    return returnUrl;
  }
  return inicio;
}

function esRutaInterna(ruta: string): boolean {
  return (
    ruta.startsWith('/') && !ruta.startsWith('//') && !ruta.includes('\\') && !ruta.includes('..')
  );
}

function empiezaEn(ruta: string, prefijo: '/admin' | '/app'): boolean {
  return ruta === prefijo || ruta.startsWith(`${prefijo}/`) || ruta.startsWith(`${prefijo}?`);
}
