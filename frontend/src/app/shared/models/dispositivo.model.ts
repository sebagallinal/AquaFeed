/** Estado de vinculación. Un dispositivo tiene un solo dueño. */
export type EstadoVinculo = 'unclaimed' | 'claimed';

/**
 * Dispositivo físico (la pecera, para quien la usa).
 * `id` sigue el formato del contrato: `af-` + MAC.
 */
export interface Dispositivo {
  id: string;
  nombre: string;
  ownerId: string | null;
  speciesProfileId: string | null;
  tz: string;
  /** Versión del calendario guardado en el backend. */
  configVersion: number;
  /** Versión que el dispositivo confirmó que aplicó. null si nunca informó. */
  configAplicada: number | null;
  /** ISO 8601 de la última vez que el backend lo vio, o null si nunca conectó. */
  lastSeen: string | null;
  online: boolean;
  estado: EstadoVinculo;
  fw: string | null;
  rssi: number | null;
}
