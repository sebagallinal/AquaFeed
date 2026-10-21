import type { PerfilEspecie, RangosEspecie } from './models/perfil-especie.model';
import type {
  AlimentacionReporte,
  LecturaReporte,
  OrigenAlimentacion,
} from './models/reporte.model';

const ZONA = 'America/Argentina/Buenos_Aires';
/** Marca de UTF-8 al principio del CSV: sin ella Excel muestra mal los acentos. */
const BOM = String.fromCharCode(0xfeff);

export type Parametro = 'temp' | 'ph' | 'tds';
export type EstadoRango = 'ideal' | 'advertencia' | 'critico' | 'sin-dato';

export const PARAMETROS: readonly {
  clave: Parametro;
  nombre: string;
  unidad: string;
  decimales: number;
}[] = [
  { clave: 'temp', nombre: 'Temperatura', unidad: '°C', decimales: 1 },
  { clave: 'ph', nombre: 'pH', unidad: '', decimales: 2 },
  { clave: 'tds', nombre: 'TDS', unidad: 'ppm', decimales: 0 },
];

export const ORIGENES: readonly { clave: OrigenAlimentacion; nombre: string }[] = [
  { clave: 'programada', nombre: 'Programada' },
  { clave: 'web', nombre: 'Desde la web' },
  { clave: 'boton', nombre: 'Botón' },
];

/**
 * Rangos de la ficha para un parámetro. TDS no tiene bandas en las fichas nuevas:
 * se usa el máximo del perfil (por encima es advertencia). null si la ficha no trae nada.
 */
export function rangosDe(
  especie: PerfilEspecie | null | undefined,
  parametro: Parametro,
): RangosEspecie | null {
  if (!especie) {
    return null;
  }
  if (parametro === 'temp') {
    return especie.temperatura ?? null;
  }
  if (parametro === 'ph') {
    return especie.ph ?? null;
  }
  if (especie.tdsMaxPpm === null) {
    return null;
  }
  return {
    ideal: { intervalo: { min: null, max: especie.tdsMaxPpm }, detalle: '' },
    advertencia: { umbral: { bajo: null, alto: especie.tdsMaxPpm }, detalle: '' },
    critico: { umbral: { bajo: null, alto: null }, detalle: '' },
  };
}

/** Crítico fuera del umbral crítico, advertencia fuera del de advertencia o del ideal. */
export function clasificar(valor: number | null, rangos: RangosEspecie): EstadoRango {
  if (valor === null) {
    return 'sin-dato';
  }
  const fuera = (bajo: number | null, alto: number | null): boolean =>
    (bajo !== null && valor < bajo) || (alto !== null && valor > alto);
  if (fuera(rangos.critico.umbral.bajo, rangos.critico.umbral.alto)) {
    return 'critico';
  }
  if (fuera(rangos.advertencia.umbral.bajo, rangos.advertencia.umbral.alto)) {
    return 'advertencia';
  }
  if (fuera(rangos.ideal.intervalo.min, rangos.ideal.intervalo.max)) {
    return 'advertencia';
  }
  return 'ideal';
}

export interface TiempoEnRango {
  ideal: number;
  advertencia: number;
  critico: number;
  sinDato: number;
  total: number;
}

/** Cuenta lecturas por estado. Como se guardan cada 5 minutos, la proporción es de tiempo. */
export function tiempoEnRango(
  lecturas: readonly LecturaReporte[],
  parametro: Parametro,
  rangos: RangosEspecie,
): TiempoEnRango {
  const cuenta: TiempoEnRango = { ideal: 0, advertencia: 0, critico: 0, sinDato: 0, total: 0 };
  for (const lectura of lecturas) {
    const estado = clasificar(lectura[parametro], rangos);
    if (estado === 'sin-dato') {
      cuenta.sinDato += 1;
    } else {
      cuenta[estado] += 1;
    }
    cuenta.total += 1;
  }
  return cuenta;
}

/** Porcentaje entero; las partes suman 100 cuando hay datos. */
export function porcentaje(parte: number, total: number): number {
  return total === 0 ? 0 : Math.round((parte / total) * 1000) / 10;
}

export interface Estadisticas {
  min: number;
  max: number;
  promedio: number;
  ultimo: number;
  cantidad: number;
}

export function estadisticas(
  lecturas: readonly LecturaReporte[],
  parametro: Parametro,
): Estadisticas | null {
  const valores = lecturas.map((l) => l[parametro]).filter((v): v is number => v !== null);
  if (valores.length === 0) {
    return null;
  }
  return {
    min: Math.min(...valores),
    max: Math.max(...valores),
    promedio: valores.reduce((a, b) => a + b, 0) / valores.length,
    ultimo: valores[valores.length - 1],
    cantidad: valores.length,
  };
}

export interface DiaAlimentacion {
  /** YYYY-MM-DD en hora de Argentina. */
  dia: string;
  etiqueta: string;
  programada: number;
  web: number;
  boton: number;
  tomas: number;
  /** Suma de porciones conocidas. */
  porciones: number;
}

/** Una fila por día del período (también los días sin tomas), en hora de Argentina. */
export function alimentacionesPorDia(
  alimentaciones: readonly AlimentacionReporte[],
  desde: number,
  hasta: number,
): DiaAlimentacion[] {
  const dias = new Map<string, DiaAlimentacion>();
  const primero = diaLocal(desde);
  for (let ts = desde; diaLocal(ts) <= diaLocal(hasta); ts += 86_400) {
    const dia = diaLocal(ts);
    if (!dias.has(dia)) {
      dias.set(dia, vacio(dia));
    }
  }
  if (!dias.has(diaLocal(hasta))) {
    dias.set(diaLocal(hasta), vacio(diaLocal(hasta)));
  }
  for (const a of alimentaciones) {
    const dia = diaLocal(a.ts);
    if (dia < primero) {
      continue;
    }
    const fila = dias.get(dia) ?? vacio(dia);
    fila[a.origen] += 1;
    fila.tomas += 1;
    fila.porciones += a.porciones ?? 0;
    dias.set(dia, fila);
  }
  return [...dias.values()].sort((a, b) => a.dia.localeCompare(b.dia));
}

function vacio(dia: string): DiaAlimentacion {
  const [, mes, d] = dia.split('-');
  return {
    dia,
    etiqueta: `${d}/${mes}`,
    programada: 0,
    web: 0,
    boton: 0,
    tomas: 0,
    porciones: 0,
  };
}

/** YYYY-MM-DD en hora de Argentina. */
export function diaLocal(epochSegundos: number): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(epochSegundos * 1000));
}

/** "2026-10-20 21:06" en hora de Argentina. */
export function fechaHoraLocal(epochSegundos: number): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(epochSegundos * 1000));
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
  return `${p['year']}-${p['month']}-${p['day']} ${p['hour']}:${p['minute']}`;
}

const NOMBRE_ORIGEN: Record<OrigenAlimentacion, string> = {
  programada: 'Programada',
  web: 'Web',
  boton: 'Botón',
};

/**
 * CSV para Excel en español: separador «;», coma decimal y BOM para que respete los acentos.
 */
export function csvLecturas(lecturas: readonly LecturaReporte[]): string {
  const filas = lecturas.map((l) => [
    fechaHoraLocal(l.ts),
    decimal(l.temp, 2),
    decimal(l.ph, 2),
    decimal(l.tds, 0),
  ]);
  return csv(['Fecha y hora', 'Temperatura (°C)', 'pH', 'TDS (ppm)'], filas);
}

export function csvAlimentaciones(alimentaciones: readonly AlimentacionReporte[]): string {
  const filas = alimentaciones.map((a) => [
    fechaHoraLocal(a.ts),
    NOMBRE_ORIGEN[a.origen],
    a.porciones === null ? '' : String(a.porciones),
  ]);
  return csv(['Fecha y hora', 'Origen', 'Porciones'], filas);
}

function decimal(valor: number | null, decimales: number): string {
  return valor === null ? '' : valor.toFixed(decimales).replace('.', ',');
}

function csv(encabezado: string[], filas: string[][]): string {
  const celda = (texto: string): string =>
    /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  const lineas = [encabezado, ...filas].map((fila) => fila.map(celda).join(';'));
  return `${BOM}${lineas.join('\r\n')}\r\n`;
}
