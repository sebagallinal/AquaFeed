import { Component, computed, input, model } from '@angular/core';
import { Observable, of } from 'rxjs';

import { ID_DISPOSITIVO, normalizarIdDispositivo } from '../../clave';
import type { DatosApi, DispositivoAdmin } from '../../data/datos-api';

/** Valor del select para «escribir el ID de una placa nueva». */
export const OTRO_ID = '__otro__';

/**
 * Elegir una placa sin dueño o escribir el ID de una que todavía no se conectó.
 * `seleccion`: '' (ninguna), el id de una placa libre u OTRO_ID.
 */
@Component({
  selector: 'app-elegir-dispositivo',
  templateUrl: './elegir-dispositivo.html',
})
export class ElegirDispositivo {
  readonly dispositivos = input.required<readonly DispositivoAdmin[]>();
  readonly etiqueta = input('Dispositivo');
  readonly textoNinguno = input('Ninguno por ahora');
  readonly seleccion = model('');
  readonly idNuevo = model('');

  protected readonly otro = OTRO_ID;
  protected readonly libres = computed(() => this.dispositivos().filter((d) => d.ownerId === null));
  protected readonly idInvalido = computed(
    () =>
      this.seleccion() === OTRO_ID &&
      this.idNuevo().trim() !== '' &&
      !ID_DISPOSITIVO.test(normalizarIdDispositivo(this.idNuevo())),
  );
}

/** Error a mostrar antes de enviar, o null. */
export function errorEleccion(
  seleccion: string,
  idNuevo: string,
  dispositivos: readonly DispositivoAdmin[],
): string | null {
  if (seleccion !== OTRO_ID) {
    return null;
  }
  const id = normalizarIdDispositivo(idNuevo);
  if (!ID_DISPOSITIVO.test(id)) {
    return 'Escribí el ID de la placa: af- y los 12 caracteres de la MAC (sale en el monitor serie).';
  }
  const existente = dispositivos.find((d) => d.id === id);
  if (existente?.ownerId) {
    return `Esa placa ya es de ${existente.duenoNombre ?? 'otro usuario'}. Quitásela primero desde su ficha.`;
  }
  return null;
}

/** Asigna la placa elegida al usuario; si es un ID nuevo, la registra. */
export function aplicarEleccion(
  datos: DatosApi,
  usuarioId: string,
  seleccion: string,
  idNuevo: string,
  dispositivos: readonly DispositivoAdmin[],
): Observable<DispositivoAdmin | null> {
  if (!seleccion) {
    return of(null);
  }
  if (seleccion !== OTRO_ID) {
    return datos.asignarDispositivo(seleccion, usuarioId);
  }
  const id = normalizarIdDispositivo(idNuevo);
  // Si ya estaba registrada (sin dueño) alcanza con asignarla
  return dispositivos.some((d) => d.id === id)
    ? datos.asignarDispositivo(id, usuarioId)
    : datos.registrarDispositivo({ id, usuarioId });
}
