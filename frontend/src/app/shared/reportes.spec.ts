import type { RangosEspecie } from './models/perfil-especie.model';
import type { AlimentacionReporte, LecturaReporte } from './models/reporte.model';
import {
  alimentacionesPorDia,
  clasificar,
  csvAlimentaciones,
  csvLecturas,
  estadisticas,
  porcentaje,
  tiempoEnRango,
} from './reportes';

// Rangos de temperatura del guppy: ideal 22–28, crítico fuera de 17–32
const TEMP: RangosEspecie = {
  ideal: { intervalo: { min: 22, max: 28 }, detalle: '' },
  advertencia: { umbral: { bajo: 22, alto: 28 }, detalle: '' },
  critico: { umbral: { bajo: 17, alto: 32 }, detalle: '' },
};

/** 2026-10-20 12:00 en Argentina (UTC-3). */
const MEDIODIA = Date.UTC(2026, 9, 20, 15, 0, 0) / 1000;

function lectura(ts: number, temp: number | null): LecturaReporte {
  return { ts, temp, ph: 7, tds: 300 };
}

describe('clasificar', () => {
  it('separa ideal, advertencia, crítico y sin dato', () => {
    expect(clasificar(25, TEMP)).toBe('ideal');
    expect(clasificar(22, TEMP)).toBe('ideal');
    expect(clasificar(29, TEMP)).toBe('advertencia');
    expect(clasificar(18, TEMP)).toBe('advertencia');
    expect(clasificar(33, TEMP)).toBe('critico');
    expect(clasificar(16.9, TEMP)).toBe('critico');
    expect(clasificar(null, TEMP)).toBe('sin-dato');
  });
});

describe('tiempoEnRango', () => {
  it('cuenta las lecturas por estado', () => {
    const lecturas = [25, 26, 29, 33, null].map((t, i) => lectura(MEDIODIA + i * 300, t));
    expect(tiempoEnRango(lecturas, 'temp', TEMP)).toEqual({
      ideal: 2,
      advertencia: 1,
      critico: 1,
      sinDato: 1,
      total: 5,
    });
    expect(porcentaje(2, 5)).toBe(40);
    expect(porcentaje(1, 3)).toBe(33.3);
    expect(porcentaje(0, 0)).toBe(0);
  });
});

describe('estadisticas', () => {
  it('ignora los nulos', () => {
    const lecturas = [24, null, 26, 25].map((t, i) => lectura(MEDIODIA + i * 300, t));
    expect(estadisticas(lecturas, 'temp')).toEqual({
      min: 24,
      max: 26,
      promedio: 25,
      ultimo: 25,
      cantidad: 3,
    });
    expect(estadisticas([lectura(MEDIODIA, null)], 'temp')).toBeNull();
  });
});

describe('alimentacionesPorDia', () => {
  it('agrupa por día de Argentina e incluye los días vacíos', () => {
    const alimentaciones: AlimentacionReporte[] = [
      { ts: MEDIODIA, origen: 'programada', porciones: 2 },
      { ts: MEDIODIA + 60, origen: 'boton', porciones: 1 },
      // 23:30 del 20 en Argentina, que en UTC ya es el 21
      { ts: MEDIODIA + 11.5 * 3600, origen: 'web', porciones: null },
    ];
    const dias = alimentacionesPorDia(alimentaciones, MEDIODIA - 2 * 86_400, MEDIODIA);
    expect(dias.map((d) => d.dia)).toEqual(['2026-10-18', '2026-10-19', '2026-10-20']);
    expect(dias[2]).toEqual({
      dia: '2026-10-20',
      etiqueta: '20/10',
      programada: 1,
      web: 1,
      boton: 1,
      tomas: 3,
      porciones: 3,
    });
    expect(dias[0].tomas).toBe(0);
  });
});

describe('CSV', () => {
  it('usa punto y coma, coma decimal, hora de Argentina y BOM', () => {
    const texto = csvLecturas([{ ts: MEDIODIA, temp: 25.456, ph: 7.1, tds: null }]);
    expect(texto.charCodeAt(0)).toBe(0xfeff);
    expect(texto).toContain('Fecha y hora;Temperatura (°C);pH;TDS (ppm)\r\n');
    expect(texto).toContain('2026-10-20 12:00;25,46;7,10;\r\n');
  });

  it('exporta las alimentaciones con su origen', () => {
    const texto = csvAlimentaciones([{ ts: MEDIODIA, origen: 'programada', porciones: 2 }]);
    expect(texto).toContain('2026-10-20 12:00;Programada;2');
  });
});
