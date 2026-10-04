/**
 * Horario semanal que el backend versiona y el dispositivo ejecuta.
 * `days` usa ISO: 1 = lunes … 7 = domingo. Máximo 8 por pecera.
 */
export interface Horario {
  id: string;
  deviceId: string;
  days: number[];
  time: string;
  portions: number;
  enabled: boolean;
}
