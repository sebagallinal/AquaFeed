import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API, type PeceraDetalle } from '../../../shared/data/datos-api';
import { etiquetaDia, textoPorciones } from '../../../shared/formato';
import {
  armarPlan,
  MAX_HORARIOS,
  MAX_PORCIONES_TOMA,
  ordenarHorarios,
  resumenSemanal,
  TODOS_LOS_DIAS,
  tomasSugeridas,
  validarHorarios,
} from '../../../shared/horarios';
import type { Horario, HorarioEditable } from '../../../shared/models/horario.model';

/** Fila del editor: `clave` solo sirve para que Angular no recree la fila al editarla. */
type Fila = HorarioEditable & { clave: number };

interface Aviso {
  tipo: 'ok' | 'error';
  texto: string;
}

@Component({
  selector: 'app-horarios',
  imports: [RouterLink],
  templateUrl: './horarios.html',
})
export class Horarios {
  readonly id = input.required<string>();

  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);
  private siguienteClave = 0;

  protected readonly detalle = signal<PeceraDetalle | null | undefined>(undefined);
  protected readonly filas = signal<Fila[]>([]);
  /** true desde que se toca algo hasta que se guarda o descarta: el refresco no pisa la edición. */
  protected readonly tocado = signal(false);
  protected readonly guardando = signal(false);
  protected readonly aviso = signal<Aviso | null>(null);

  // Plan rápido: tomas por día y porciones iguales, repartidas entre dos horas
  protected readonly planTomas = signal(2);
  protected readonly planPorciones = signal(1);
  protected readonly planDesde = signal('08:00');
  protected readonly planHasta = signal('20:00');
  protected readonly planDias = signal<number[]>([...TODOS_LOS_DIAS]);

  protected readonly dias = TODOS_LOS_DIAS;
  protected readonly opcionesPorciones = Array.from(
    { length: MAX_PORCIONES_TOMA },
    (_, i) => i + 1,
  );
  protected readonly opcionesTomas = Array.from({ length: MAX_HORARIOS }, (_, i) => i + 1);
  protected readonly maxHorarios = MAX_HORARIOS;
  protected readonly etiquetaDia = etiquetaDia;
  protected readonly textoPorciones = textoPorciones;

  protected readonly error = computed(() => validarHorarios(this.filas()));
  protected readonly resumen = computed(() => resumenSemanal(this.filas()));
  protected readonly vistaPlan = computed(() =>
    armarPlan({
      tomasPorDia: this.planTomas(),
      porciones: this.planPorciones(),
      desde: this.planDesde(),
      hasta: this.planHasta(),
      days: this.planDias(),
    }),
  );

  protected readonly sugerencia = computed(() => {
    const especie = this.detalle()?.especie;
    const tomas = tomasSugeridas(especie?.dosis?.tomasPorDia);
    return especie && tomas ? { especie: especie.nombre, tomas } : null;
  });

  protected readonly sincronizacion = computed(() => {
    const dispositivo = this.detalle()?.dispositivo;
    if (!dispositivo || dispositivo.configVersion === 0) {
      return null;
    }
    if (dispositivo.configAplicada === dispositivo.configVersion) {
      return { ok: true, texto: 'La pecera tiene el calendario actualizado.' };
    }
    return {
      ok: false,
      texto: dispositivo.online
        ? 'Enviando el calendario a la pecera…'
        : 'La pecera recibe el calendario cuando vuelva a conectarse.',
    };
  });

  constructor() {
    effect((onCleanup) => {
      const sub = this.datos.pecera(this.id(), this.auth.usuario()?.id ?? '').subscribe((valor) => {
        this.detalle.set(valor);
        if (valor && !this.tocado()) {
          this.filas.set(this.aFilas(valor.horarios));
        }
      });
      onCleanup(() => sub.unsubscribe());
    });

    // La primera vez, el plan rápido arranca con lo que sugiere la ficha de la especie
    let sugerido = false;
    effect(() => {
      const sugerencia = this.sugerencia();
      if (sugerencia && !sugerido) {
        sugerido = true;
        this.planTomas.set(Math.min(sugerencia.tomas, MAX_HORARIOS));
      }
    });
  }

  protected aplicarPlan(): void {
    this.editar(() => this.aFilas(this.vistaPlan()));
  }

  protected agregar(): void {
    this.editar((filas) => [
      ...filas,
      {
        clave: this.siguienteClave++,
        days: [...TODOS_LOS_DIAS],
        time: '12:00',
        portions: 1,
        enabled: true,
      },
    ]);
  }

  protected quitar(clave: number): void {
    this.editar((filas) => filas.filter((f) => f.clave !== clave));
  }

  protected cambiar(clave: number, cambio: Partial<HorarioEditable>): void {
    this.editar((filas) => filas.map((f) => (f.clave === clave ? { ...f, ...cambio } : f)));
  }

  protected alternarDia(fila: Fila, dia: number): void {
    const days = fila.days.includes(dia)
      ? fila.days.filter((d) => d !== dia)
      : [...fila.days, dia].sort((a, b) => a - b);
    this.cambiar(fila.clave, { days });
  }

  protected alternarDiaPlan(dia: number): void {
    this.planDias.update((dias) =>
      dias.includes(dia) ? dias.filter((d) => d !== dia) : [...dias, dia].sort((a, b) => a - b),
    );
  }

  protected descartar(): void {
    this.tocado.set(false);
    this.aviso.set(null);
    this.filas.set(this.aFilas(this.detalle()?.horarios ?? []));
  }

  protected guardar(): void {
    if (this.error() || this.guardando()) {
      return;
    }
    const horarios: HorarioEditable[] = ordenarHorarios(this.filas()).map(
      ({ days, time, portions, enabled }) => ({ days, time, portions, enabled }),
    );
    this.guardando.set(true);
    this.aviso.set(null);
    this.datos.guardarHorarios(this.id(), this.auth.usuario()?.id ?? '', horarios).subscribe({
      next: (respuesta) => {
        this.guardando.set(false);
        this.tocado.set(false);
        this.filas.set(this.aFilas(respuesta.horarios));
        this.aviso.set({
          tipo: 'ok',
          texto: respuesta.enviado
            ? 'Guardado. La pecera ya recibió el calendario y lo cumple aunque se corte internet.'
            : 'Guardado. La pecera lo va a recibir apenas se conecte.',
        });
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.aviso.set({
          tipo: 'error',
          texto: error instanceof Error ? error.message : 'No se pudieron guardar los horarios.',
        });
      },
    });
  }

  protected textoDia(dia: number): string {
    const r = this.resumen()[dia - 1];
    if (!r || r.tomas === 0) {
      return 'sin tomas';
    }
    return `${r.tomas} ${r.tomas === 1 ? 'toma' : 'tomas'} · ${textoPorciones(r.porciones)}`;
  }

  private editar(cambio: (filas: Fila[]) => Fila[]): void {
    this.tocado.set(true);
    this.aviso.set(null);
    this.filas.update(cambio);
  }

  private aFilas(horarios: readonly (Horario | HorarioEditable)[]): Fila[] {
    return ordenarHorarios(horarios).map(({ days, time, portions, enabled }) => ({
      clave: this.siguienteClave++,
      days: [...days],
      time,
      portions,
      enabled,
    }));
  }
}
