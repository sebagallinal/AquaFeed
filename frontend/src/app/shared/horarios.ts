import type { HorarioEditable } from './models/horario.model';

/** Mismos límites que valida el backend (aquafeed-app/server/api-v1.js). */
export const MAX_HORARIOS = 8;
export const MAX_PORCIONES_TOMA = 5;
export const TODOS_LOS_DIAS: readonly number[] = [1, 2, 3, 4, 5, 6, 7];

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Devuelve el primer problema del calendario, o null si se puede guardar. */
export function validarHorarios(lista: readonly HorarioEditable[]): string | null {
  if (lista.length > MAX_HORARIOS) {
    return `Se pueden cargar hasta ${MAX_HORARIOS} horarios por pecera.`;
  }
  const vistos = new Set<string>();
  for (const horario of lista) {
    if (horario.days.length === 0) {
      return 'Cada horario necesita al menos un día de la semana.';
    }
    if (!HORA.test(horario.time)) {
      return 'Completá la hora de cada horario.';
    }
    if (
      !Number.isInteger(horario.portions) ||
      horario.portions < 1 ||
      horario.portions > MAX_PORCIONES_TOMA
    ) {
      return `Las porciones van de 1 a ${MAX_PORCIONES_TOMA}.`;
    }
    if (!horario.enabled) {
      continue;
    }
    for (const dia of horario.days) {
      const clave = `${dia}-${horario.time}`;
      if (vistos.has(clave)) {
        return `Hay dos horarios activos el mismo día a las ${horario.time}.`;
      }
      vistos.add(clave);
    }
  }
  return null;
}

export interface PlanDiario {
  tomasPorDia: number;
  porciones: number;
  desde: string;
  hasta: string;
  days: readonly number[];
}

/**
 * Reparte las tomas en forma pareja entre `desde` y `hasta`, redondeando a 5 minutos.
 * Con una sola toma usa `desde`.
 */
export function armarPlan(plan: PlanDiario): HorarioEditable[] {
  const tomas = Math.min(Math.max(Math.round(plan.tomasPorDia), 1), MAX_HORARIOS);
  const porciones = Math.min(Math.max(Math.round(plan.porciones), 1), MAX_PORCIONES_TOMA);
  const inicio = aMinutos(plan.desde);
  const fin = Math.max(aMinutos(plan.hasta), inicio);
  const paso = tomas === 1 ? 0 : (fin - inicio) / (tomas - 1);
  const horas = new Set<string>();
  for (let i = 0; i < tomas; i += 1) {
    const minutos = Math.min(Math.round((inicio + paso * i) / 5) * 5, 23 * 60 + 55);
    horas.add(aHora(minutos));
  }
  const days = [...plan.days].sort((a, b) => a - b);
  return [...horas].map((time) => ({ days: [...days], time, portions: porciones, enabled: true }));
}

export interface ResumenDia {
  dia: number;
  tomas: number;
  porciones: number;
}

/** Tomas y porciones activas por día de la semana (ISO 1 = lunes). */
export function resumenSemanal(lista: readonly HorarioEditable[]): ResumenDia[] {
  return TODOS_LOS_DIAS.map((dia) => {
    const activos = lista.filter((h) => h.enabled && h.days.includes(dia));
    return {
      dia,
      tomas: activos.length,
      porciones: activos.reduce((total, h) => total + h.portions, 0),
    };
  });
}

/** Primer número de la ficha ("2", "1–2", "4 (estimadas…)"), o null si no trae. */
export function tomasSugeridas(texto: string | null | undefined): number | null {
  const encontrado = texto?.match(/\d+/);
  return encontrado ? Number(encontrado[0]) : null;
}

/** Orden para mostrar: por hora y, a la misma hora, los activos primero. */
export function ordenarHorarios<T extends HorarioEditable>(lista: readonly T[]): T[] {
  return [...lista].sort(
    (a, b) => a.time.localeCompare(b.time) || Number(b.enabled) - Number(a.enabled),
  );
}

function aMinutos(hora: string): number {
  if (!HORA.test(hora)) {
    return 8 * 60;
  }
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function aHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
