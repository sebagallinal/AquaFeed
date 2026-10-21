const ZONA = 'America/Argentina/Buenos_Aires';

export interface Escala {
  min: number;
  max: number;
  ticks: number[];
}

/** Escala con 4–6 marcas en números redondos (1, 2, 2,5 o 5 por potencia de 10). */
export function escalaLimpia(minimo: number, maximo: number, marcas = 5): Escala {
  let min = minimo;
  let max = maximo;
  if (min === max) {
    const margen = Math.abs(min) * 0.05 || 1;
    min -= margen;
    max += margen;
  }
  const crudo = (max - min) / (marcas - 1);
  const potencia = 10 ** Math.floor(Math.log10(crudo));
  const paso = [1, 2, 2.5, 5, 10].map((f) => f * potencia).find((p) => p >= crudo) ?? crudo;
  const inicio = Math.floor(min / paso) * paso;
  const fin = Math.ceil(max / paso) * paso;
  const ticks: number[] = [];
  for (let v = inicio; v <= fin + paso / 2; v += paso) {
    ticks.push(Math.round(v * 1e6) / 1e6);
  }
  return { min: inicio, max: fin, ticks };
}

export interface TickTiempo {
  t: number;
  etiqueta: string;
}

/**
 * Marcas del eje de tiempo en hora de Argentina: cada 6 h en un día, o un día cada tanto
 * en períodos largos, con al menos ~70 px entre etiquetas.
 */
export function ticksTiempo(desde: number, hasta: number, anchoPx: number): TickTiempo[] {
  const duracion = hasta - desde;
  const maxMarcas = Math.max(2, Math.floor(anchoPx / 70));
  const pasos = [
    3600,
    2 * 3600,
    3 * 3600,
    6 * 3600,
    12 * 3600,
    86_400,
    2 * 86_400,
    5 * 86_400,
    7 * 86_400,
  ];
  const paso = pasos.find((p) => duracion / p <= maxMarcas) ?? 7 * 86_400;
  const enDias = paso >= 86_400;
  const formato = new Intl.DateTimeFormat(
    'es-AR',
    enDias
      ? { timeZone: ZONA, day: '2-digit', month: '2-digit' }
      : { timeZone: ZONA, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
  );
  // Alineado a la medianoche de Argentina: 03:00 UTC (UTC-3, sin horario de verano)
  const offset = 3 * 3600;
  const salida: TickTiempo[] = [];
  for (let t = Math.ceil((desde - offset) / paso) * paso + offset; t <= hasta; t += paso) {
    salida.push({ t, etiqueta: formato.format(new Date(t * 1000)) });
  }
  return salida;
}
