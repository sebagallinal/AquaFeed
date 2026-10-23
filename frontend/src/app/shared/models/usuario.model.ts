/** Rol de la cuenta. El backend es quien lo autoriza; el front solo lo usa para la navegación. */
export type Rol = 'admin' | 'user';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  /** Usuario para entrar (también se puede entrar con el correo). */
  username?: string;
}

export interface NuevoUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

/** Solo viaja lo que cambia. */
export type CambiosUsuario = Partial<NuevoUsuario & { activo: boolean }>;

export interface Credenciales {
  email: string;
  password: string;
}
