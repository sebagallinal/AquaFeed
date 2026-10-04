/** Rol de la cuenta. El backend es quien lo autoriza; el front solo lo usa para la navegación. */
export type Rol = 'admin' | 'user';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
}

export interface Credenciales {
  email: string;
  password: string;
}
