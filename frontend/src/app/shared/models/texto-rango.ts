import type {
  DosisPellets,
  Intervalo,
  SuspensionAlimentacion,
  UmbralFueraDe,
} from './perfil-especie.model';

export function numeroSuelto(valor: number): string {
  return valor.toLocaleString('es-AR', { maximumFractionDigits: 1 });
}

export function textoIntervalo(intervalo: Intervalo, unidad = ''): string | null {
  const { min, max } = intervalo;
  if (min === null && max === null) {
    return null;
  }
  const sufijo = unidad ? ` ${unidad}` : '';
  if (min !== null && max !== null) {
    if (min === max) {
      return `${numeroSuelto(min)}${sufijo}`;
    }
    return `${numeroSuelto(min)}–${numeroSuelto(max)}${sufijo}`;
  }
  if (min !== null) {
    return `desde ${numeroSuelto(min)}${sufijo}`;
  }
  if (max === null) {
    return null;
  }
  return `hasta ${numeroSuelto(max)}${sufijo}`;
}

/** «Por debajo de 4,4 °C o por encima de 20 °C», o null si no hay umbrales. */
export function textoUmbral(umbral: UmbralFueraDe, unidad: string): string | null {
  const sufijo = unidad ? ` ${unidad}` : '';
  const partes: string[] = [];
  if (umbral.bajo !== null) {
    partes.push(`por debajo de ${numeroSuelto(umbral.bajo)}${sufijo}`);
  }
  if (umbral.alto !== null) {
    partes.push(`por encima de ${numeroSuelto(umbral.alto)}${sufijo}`);
  }
  if (!partes.length) {
    return null;
  }
  const texto = partes.join(' o ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function textoPelletsPorToma(dosis: DosisPellets): string {
  if (dosis.porToma === null) {
    return 'Sin dato en la ficha';
  }
  if (dosis.porTomaHasta === null) {
    return `${dosis.porToma} pellets`;
  }
  return `${dosis.porToma}–${dosis.porTomaHasta} pellets`;
}

export function textoPelletsPorDia(dosis: DosisPellets): string {
  if (dosis.porDia === null) {
    return 'Sin dato en la ficha';
  }
  if (dosis.porDiaHasta == null) {
    return `${dosis.porDia} pellets`;
  }
  return `${dosis.porDia}–${dosis.porDiaHasta} pellets`;
}

export function textoPelletMm(dosis: DosisPellets): string {
  return dosis.pelletMm === null ? 'Sin dato en la ficha' : `${numeroSuelto(dosis.pelletMm)} mm`;
}

export function textoSuspension(suspension: SuspensionAlimentacion): string {
  const partes: string[] = [];
  if (suspension.bajoC !== null) {
    partes.push(`por debajo de ${numeroSuelto(suspension.bajoC)} °C`);
  }
  if (suspension.sobreC !== null) {
    partes.push(`desde ${numeroSuelto(suspension.sobreC)} °C`);
  }
  if (!partes.length) {
    return 'Sin dato en la ficha';
  }
  const base = `Se suspende ${partes.join(' o ')}.`;
  if (!suspension.bajoEsCriterioDeDiseno) {
    return base;
  }
  return `${base} El límite bajo es un criterio de diseño de la ficha, no un dato publicado de la especie.`;
}
