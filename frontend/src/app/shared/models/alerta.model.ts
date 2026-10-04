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
  parametro?: ParametroAlerta;
}
