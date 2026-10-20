import type { HorarioEditable } from './models/horario.model';
import {
  armarPlan,
  MAX_HORARIOS,
  ordenarHorarios,
  resumenSemanal,
  tomasSugeridas,
  validarHorarios,
} from './horarios';

function horario(parcial: Partial<HorarioEditable> = {}): HorarioEditable {
  return { days: [1, 2, 3, 4, 5, 6, 7], time: '09:00', portions: 1, enabled: true, ...parcial };
}

describe('validarHorarios', () => {
  it('acepta un calendario válido', () => {
    expect(validarHorarios([horario(), horario({ time: '19:30', portions: 2 })])).toBeNull();
  });

  it('pide al menos un día', () => {
    expect(validarHorarios([horario({ days: [] })])).toContain('al menos un día');
  });

  it('pide la hora', () => {
    expect(validarHorarios([horario({ time: '' })])).toContain('hora');
  });

  it('limita las porciones', () => {
    expect(validarHorarios([horario({ portions: 6 })])).toContain('porciones');
  });

  it('no deja dos tomas activas a la misma hora el mismo día', () => {
    expect(validarHorarios([horario(), horario({ days: [3] })])).toContain('09:00');
  });

  it('permite repetir la hora si una está pausada', () => {
    expect(validarHorarios([horario(), horario({ days: [3], enabled: false })])).toBeNull();
  });

  it(`limita a ${MAX_HORARIOS} horarios`, () => {
    const lista = Array.from({ length: MAX_HORARIOS + 1 }, (_, i) =>
      horario({ time: `${10 + i}:00` }),
    );
    expect(validarHorarios(lista)).toContain(String(MAX_HORARIOS));
  });
});

describe('armarPlan', () => {
  const base = { porciones: 2, desde: '08:00', hasta: '20:00', days: [1, 2, 3, 4, 5, 6, 7] };

  it('reparte las tomas en forma pareja', () => {
    expect(armarPlan({ ...base, tomasPorDia: 3 }).map((h) => h.time)).toEqual([
      '08:00',
      '14:00',
      '20:00',
    ]);
  });

  it('redondea a 5 minutos', () => {
    expect(armarPlan({ ...base, hasta: '09:00', tomasPorDia: 4 }).map((h) => h.time)).toEqual([
      '08:00',
      '08:20',
      '08:40',
      '09:00',
    ]);
    expect(armarPlan({ ...base, hasta: '08:50', tomasPorDia: 3 }).map((h) => h.time)).toEqual([
      '08:00',
      '08:25',
      '08:50',
    ]);
  });

  it('con una toma usa la hora de inicio', () => {
    expect(armarPlan({ ...base, tomasPorDia: 1 })).toEqual([
      { days: base.days, time: '08:00', portions: 2, enabled: true },
    ]);
  });

  it('respeta los topes y queda válido', () => {
    const plan = armarPlan({ ...base, tomasPorDia: 20, porciones: 9 });
    expect(plan.length).toBe(MAX_HORARIOS);
    expect(plan.every((h) => h.portions === 5)).toBe(true);
    expect(validarHorarios(plan)).toBeNull();
  });
});

describe('resumenSemanal', () => {
  it('cuenta tomas y porciones activas por día', () => {
    const resumen = resumenSemanal([
      horario({ portions: 2 }),
      horario({ time: '20:00', days: [6, 7], portions: 1 }),
      horario({ time: '13:00', enabled: false }),
    ]);
    expect(resumen[0]).toEqual({ dia: 1, tomas: 1, porciones: 2 });
    expect(resumen[6]).toEqual({ dia: 7, tomas: 2, porciones: 3 });
  });
});

describe('tomasSugeridas', () => {
  it('toma el primer número de la ficha', () => {
    expect(tomasSugeridas('2')).toBe(2);
    expect(tomasSugeridas('1–2')).toBe(1);
    expect(tomasSugeridas('4 (estimadas; la fuente solo dice varias por día)')).toBe(4);
    expect(tomasSugeridas(null)).toBeNull();
  });
});

describe('ordenarHorarios', () => {
  it('ordena por hora con los activos primero', () => {
    const orden = ordenarHorarios([
      horario({ time: '20:00' }),
      horario({ time: '08:00', enabled: false }),
      horario({ time: '08:00' }),
    ]);
    expect(orden.map((h) => `${h.time}-${h.enabled}`)).toEqual([
      '08:00-true',
      '08:00-false',
      '20:00-true',
    ]);
  });
});
