export type TipoAlerta = 'parametro' | 'offline' | 'atasco' | 'sensor' | 'alimentacion' | 'config';

export type EstadoAlerta = 'abierta' | 'reconocida' | 'cerrada';

export type ParametroAlerta = 'waterTempC' | 'ph' | 'tdsPpm';

export interface Alerta {
  id: string;
  deviceId: string;
  tipo: TipoAlerta;
  estado: EstadoAlerta;
  mensaje: string;
  /** ISO 8601. */
  abiertaEn: string;
  /** ISO 8601 de cuando se normalizó sola. null o ausente mientras sigue pasando. */
  cerradaEn?: string | null;
  parametro?: ParametroAlerta;
}

/**
 * Límites que vigila el backend para una pecera. null = ese lado no se controla.
 * offlineMin: minutos sin datos para avisar que se desconectó (null = no avisar).
 */
export interface ConfigAlertas {
  tempMin: number | null;
  tempMax: number | null;
  phMin: number | null;
  phMax: number | null;
  tdsMin: number | null;
  tdsMax: number | null;
  offlineMin: number | null;
}

export const CONFIG_ALERTAS_DEFECTO: ConfigAlertas = {
  tempMin: null,
  tempMax: null,
  phMin: null,
  phMax: null,
  tdsMin: null,
  tdsMax: null,
  offlineMin: 10,
};
