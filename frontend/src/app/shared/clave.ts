/** Sin caracteres que se confunden al dictarlos o copiarlos a mano (0/O, 1/l/I). */
const ALFABETO = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Contraseña temporal para una cuenta nueva o un reseteo. */
export function generarClave(largo = 10): string {
  const azar = new Uint32Array(largo);
  crypto.getRandomValues(azar);
  return Array.from(azar, (n) => ALFABETO[n % ALFABETO.length]).join('');
}

/** ID de placa: af- y la MAC en 12 hexadecimales, en minúsculas. */
export const ID_DISPOSITIVO = /^af-[0-9a-f]{12}$/;

export function normalizarIdDispositivo(texto: string): string {
  return texto.trim().toLowerCase();
}
