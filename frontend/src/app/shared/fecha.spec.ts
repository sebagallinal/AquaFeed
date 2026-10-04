import type { Horario } from './models/horario.model';
import { proximaAlimentacion } from './fecha';

function horario(parcial: Partial<Horario> & Pick<Horario, 'time' | 'days'>): Horario {
  return {
    id: parcial.time,
    deviceId: 'af-test',
    portions: 1,
    enabled: true,
    ...parcial,
  };
}

describe('proximaAlimentacion', () => {
  it('elige la toma de hoy que todavía no pasó', () => {
    const ahora = new Date('2026-09-28T12:00:00-03:00');
    const result = proximaAlimentacion(
      [
        horario({ time: '09:00', days: [1, 2, 3, 4, 5, 6, 7], portions: 2 }),
        horario({ time: '19:30', days: [1, 2, 3, 4, 5, 6, 7], portions: 1 }),
      ],
      ahora,
    );
    expect(result?.etiqueta).toBe('Hoy 19:30 · 1 porción');
  });

  it('pasa a la semana siguiente si la toma de hoy ya ocurrió', () => {
    const ahora = new Date('2026-09-28T21:00:00-03:00');
    const result = proximaAlimentacion([horario({ time: '09:00', days: [1], portions: 2 })], ahora);
    expect(result?.portions).toBe(2);
    expect(result?.etiqueta).toContain('09:00');
    expect(result?.etiqueta).toContain('2 porciones');
    expect(result?.etiqueta.startsWith('Hoy')).toBe(false);
    expect(result?.etiqueta.startsWith('Mañana')).toBe(false);
  });

  it('ignora horarios pausados', () => {
    const ahora = new Date('2026-09-28T08:00:00-03:00');
    const result = proximaAlimentacion(
      [horario({ time: '09:00', days: [1, 2, 3, 4, 5, 6, 7], enabled: false })],
      ahora,
    );
    expect(result).toBeNull();
  });
});
