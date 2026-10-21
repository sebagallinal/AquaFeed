/** Períodos que ofrece la pantalla de reportes, en días. */
export type PeriodoReporte = 1 | 7 | 30;

/** Lectura guardada en la base (una cada 5 minutos). `ts` en segundos. */
export interface LecturaReporte {
  ts: number;
  temp: number | null;
  ph: number | null;
  tds: number | null;
}

export type OrigenAlimentacion = 'web' | 'boton' | 'programada';

export interface AlimentacionReporte {
  ts: number;
  origen: OrigenAlimentacion;
  /** null en registros anteriores a que se guardaran las porciones. */
  porciones: number | null;
}

export interface ReporteDatos {
  deviceId: string;
  dias: PeriodoReporte;
  /** Epoch en segundos. */
  desde: number;
  hasta: number;
  lecturas: LecturaReporte[];
  alimentaciones: AlimentacionReporte[];
}
