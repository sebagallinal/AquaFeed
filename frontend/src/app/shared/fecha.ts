import { textoPorciones } from './formato';
import type { Horario } from './models/horario.model';

const ZONA = 'America/Argentina/Buenos_Aires';

export interface ProximaAlimentacion {
  fecha: Date;
  portions: number;
  etiqueta: string;
}

interface FechaZona {
  anio: number;
  mes: number;
  dia: number;
}

/** Próxima toma habilitada, en hora local del dispositivo (Argentina en esta versión). */
export function proximaAlimentacion(
  horarios: readonly Horario[],
  ahora = new Date(),
): ProximaAlimentacion | null {
  const candidatos: { fecha: Date; portions: number }[] = [];

  for (let offset = 0; offset < 8; offset += 1) {
    const dia = sumarDiasZona(ahora, offset);
    const iso = diaSemanaIso(dia);
    for (const horario of horarios) {
      if (!horario.enabled || !horario.days.includes(iso)) {
        continue;
      }
      const [horaTexto, minutoTexto] = horario.time.split(':');
      const hora = Number(horaTexto);
      const minuto = Number(minutoTexto);
      if (!Number.isInteger(hora) || !Number.isInteger(minuto)) {
        continue;
      }
      const fecha = fechaEnZona(dia.anio, dia.mes, dia.dia, hora, minuto);
      if (fecha.getTime() > ahora.getTime()) {
        candidatos.push({ fecha, portions: horario.portions });
      }
    }
  }

  candidatos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
  const primero = candidatos[0];
  if (!primero) {
    return null;
  }
  return {
    fecha: primero.fecha,
    portions: primero.portions,
    etiqueta: etiquetar(primero.fecha, primero.portions, ahora),
  };
}

function partes(fecha: Date): FechaZona {
  const formato = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const mapa: Record<string, string> = {};
  for (const parte of formato.formatToParts(fecha)) {
    mapa[parte.type] = parte.value;
  }
  return {
    anio: Number(mapa['year']),
    mes: Number(mapa['month']),
    dia: Number(mapa['day']),
  };
}

function sumarDiasZona(base: Date, dias: number): FechaZona {
  const hoy = partes(base);
  const ancla = new Date(Date.UTC(hoy.anio, hoy.mes - 1, hoy.dia + dias, 15, 0, 0));
  return partes(ancla);
}

/** Argentina está en UTC−3, sin horario de verano. */
function fechaEnZona(anio: number, mes: number, dia: number, hora: number, minuto: number): Date {
  return new Date(Date.UTC(anio, mes - 1, dia, hora + 3, minuto, 0));
}

function diaSemanaIso(fecha: FechaZona): number {
  const instante = fechaEnZona(fecha.anio, fecha.mes, fecha.dia, 12, 0);
  const nombre = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA,
    weekday: 'short',
  }).format(instante);
  const tabla: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  const numero = tabla[nombre];
  if (numero === undefined) {
    throw new Error(`Día de semana inesperado: ${nombre}`);
  }
  return numero;
}

function misma(a: FechaZona, b: FechaZona): boolean {
  return a.anio === b.anio && a.mes === b.mes && a.dia === b.dia;
}

function etiquetar(fecha: Date, portions: number, ahora: Date): string {
  const hoy = partes(ahora);
  const manana = sumarDiasZona(ahora, 1);
  const objetivo = partes(fecha);
  const hora = new Intl.DateTimeFormat('es-AR', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(fecha);
  const porcion = textoPorciones(portions);
  if (misma(hoy, objetivo)) {
    return `Hoy ${hora} · ${porcion}`;
  }
  if (misma(manana, objetivo)) {
    return `Mañana ${hora} · ${porcion}`;
  }
  const dia = new Intl.DateTimeFormat('es-AR', {
    timeZone: ZONA,
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  }).format(fecha);
  return `${capitalizar(dia)} ${hora} · ${porcion}`;
}

function capitalizar(texto: string): string {
  if (texto.length === 0) {
    return texto;
  }
  return texto.charAt(0).toLocaleUpperCase('es-AR') + texto.slice(1);
}
