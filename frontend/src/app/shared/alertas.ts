import type { ConfigAlertas } from './models/alerta.model';
import type { PerfilEspecie } from './models/perfil-especie.model';
import { rangosDe, type Parametro } from './reportes';

/** Claves de la configuración de alertas para cada sensor. */
export const CLAVES_SENSOR: Record<
  Parametro,
  {
    min: 'tempMin' | 'phMin' | 'tdsMin';
    max: 'tempMax' | 'phMax' | 'tdsMax';
    especie: 'tempEspecie' | 'phEspecie' | 'tdsEspecie';
    nombre: string;
  }
> = {
  temp: { min: 'tempMin', max: 'tempMax', especie: 'tempEspecie', nombre: 'temperatura' },
  ph: { min: 'phMin', max: 'phMax', especie: 'phEspecie', nombre: 'pH' },
  tds: { min: 'tdsMin', max: 'tdsMax', especie: 'tdsEspecie', nombre: 'TDS' },
};

/** Rango ideal de la ficha para un sensor, o null si la ficha no lo trae. */
export function rangoIdeal(
  especie: PerfilEspecie | null | undefined,
  parametro: Parametro,
): { min: number | null; max: number | null } | null {
  const rangos = rangosDe(especie, parametro);
  if (!rangos) {
    return null;
  }
  const { min, max } = rangos.ideal.intervalo;
  return min === null && max === null ? null : { min, max };
}

export interface ConfigConEspecie {
  config: ConfigAlertas;
  /** Sensores que siguen la especie y cuyos límites cambiaron. */
  actualizados: Parametro[];
  /** Sensores que siguen la especie pero la ficha nueva no trae rango: quedan sin controlar. */
  sinRango: Parametro[];
}

/**
 * Recalcula los límites de los sensores que siguen a la especie. Los que tienen límites
 * personalizados no se tocan.
 */
export function aplicarEspecie(
  config: ConfigAlertas,
  especie: PerfilEspecie | null | undefined,
): ConfigConEspecie {
  const nueva: ConfigAlertas = { ...config };
  const actualizados: Parametro[] = [];
  const sinRango: Parametro[] = [];
  for (const parametro of Object.keys(CLAVES_SENSOR) as Parametro[]) {
    const c = CLAVES_SENSOR[parametro];
    if (!config[c.especie]) {
      continue;
    }
    const rango = rangoIdeal(especie, parametro);
    nueva[c.min] = rango?.min ?? null;
    nueva[c.max] = rango?.max ?? null;
    if (!rango) {
      sinRango.push(parametro);
    } else if (nueva[c.min] !== config[c.min] || nueva[c.max] !== config[c.max]) {
      actualizados.push(parametro);
    }
  }
  return { config: nueva, actualizados, sinRango };
}

/** «temperatura y pH» */
export function listaSensores(parametros: readonly Parametro[]): string {
  const nombres = parametros.map((p) => CLAVES_SENSOR[p].nombre);
  return nombres.length <= 1
    ? (nombres[0] ?? '')
    : `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
}
