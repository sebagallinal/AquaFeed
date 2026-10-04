/**
 * Telemetría de `aquafeed/v1/{id}/telemetry`.
 * `ts` es epoch UTC en segundos. Un sensor caído va en null y suma un código a `sensorErrors`.
 * `ambTempC` y `ambHum` existen en el contrato por si se mantiene el DHT11; esta versión no los muestra.
 */
export interface Lectura {
  deviceId: string;
  ts: number | null;
  waterTempC: number | null;
  ph: number | null;
  tdsPpm: number | null;
  ambTempC?: number | null;
  ambHum?: number | null;
  sensorErrors: string[];
}
