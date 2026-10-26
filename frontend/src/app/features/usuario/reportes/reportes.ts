import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API, type PeceraResumen } from '../../../shared/data/datos-api';
import type { PeriodoReporte, ReporteDatos } from '../../../shared/models/reporte.model';
import {
  alimentacionesPorDia,
  csvAlimentaciones,
  csvLecturas,
  estadisticas,
  PARAMETROS,
  porcentaje,
  rangosDe,
  tiempoEnRango,
  type Parametro,
} from '../../../shared/reportes';
import { GraficoBarras } from '../../../shared/ui/grafico-barras/grafico-barras';
import { GraficoLinea } from '../../../shared/ui/grafico-linea/grafico-linea';

const PERIODOS: readonly { dias: PeriodoReporte; nombre: string }[] = [
  { dias: 1, nombre: 'Últimas 24 h' },
  { dias: 7, nombre: '7 días' },
  { dias: 30, nombre: '30 días' },
];

@Component({
  selector: 'app-reportes',
  imports: [RouterLink, GraficoLinea, GraficoBarras],
  templateUrl: './reportes.html',
})
export class Reportes {
  /** ?pecera=<id> en la URL; si falta, la primera pecera del usuario. */
  readonly pecera = input<string | undefined>();

  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);
  private readonly router = inject(Router);

  protected readonly periodos = PERIODOS;
  protected readonly parametros = PARAMETROS;
  protected readonly peceras = signal<PeceraResumen[] | undefined>(undefined);
  protected readonly periodo = signal<PeriodoReporte>(7);
  protected readonly reporte = signal<ReporteDatos | null | undefined>(undefined);
  protected readonly cargando = signal(false);

  protected readonly seleccionada = computed(() => {
    const lista = this.peceras() ?? [];
    return lista.find((p) => p.dispositivo.id === this.pecera()) ?? lista[0] ?? null;
  });
  /** La pecera de la URL, o la que quedó elegida, para poder volver desde esta pantalla. */
  protected readonly destinoPecera = computed(
    () => this.seleccionada()?.dispositivo.id ?? this.pecera() ?? null,
  );
  private readonly idSeleccionada = computed(() => this.seleccionada()?.dispositivo.id ?? null);
  protected readonly especie = computed(() => this.seleccionada()?.especie ?? null);

  protected readonly porParametro = computed(() => {
    const r = this.reporte();
    if (!r) {
      return [];
    }
    return PARAMETROS.map((p) => {
      const rangos = rangosDe(this.especie(), p.clave);
      const tiempo = rangos ? tiempoEnRango(r.lecturas, p.clave, rangos) : null;
      return {
        ...p,
        rangos,
        tiempo,
        stats: estadisticas(r.lecturas, p.clave),
        puntos: r.lecturas.map((l) => ({ t: l.ts, v: l[p.clave] })),
        textoRango: rangos ? this.textoRango(p.clave) : null,
      };
    });
  });

  protected readonly dias = computed(() => {
    const r = this.reporte();
    return r ? alimentacionesPorDia(r.alimentaciones, r.desde, r.hasta) : [];
  });

  protected readonly totales = computed(() => {
    const dias = this.dias();
    const tomas = dias.reduce((t, d) => t + d.tomas, 0);
    const programadas = dias.reduce((t, d) => t + d.programada, 0);
    return {
      tomas,
      porciones: dias.reduce((t, d) => t + d.porciones, 0),
      programadas,
      // El primer día del período y hoy están incompletos: no cuentan como «sin comer»
      diasSinTomas: dias.slice(1, -1).filter((d) => d.tomas === 0).length,
    };
  });

  protected readonly porcentaje = porcentaje;

  constructor() {
    effect((onCleanup) => {
      const sub = this.datos
        .pecerasDe(this.auth.usuario()?.id ?? '')
        .subscribe((lista) => this.peceras.set(lista));
      onCleanup(() => sub.unsubscribe());
    });

    // Cambia la pecera o el período: se piden los datos de nuevo.
    // Mientras tanto queda el reporte anterior, atenuado, para que la pantalla no salte.
    effect((onCleanup) => {
      const id = this.idSeleccionada();
      const dias = this.periodo();
      if (!id) {
        return;
      }
      this.cargando.set(true);
      const sub = this.datos.reporte(id, this.auth.usuario()?.id ?? '', dias).subscribe({
        next: (r) => {
          this.reporte.set(r);
          this.cargando.set(false);
        },
        error: () => {
          this.reporte.set(null);
          this.cargando.set(false);
        },
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected elegirPecera(id: string): void {
    void this.router.navigate([], { queryParams: { pecera: id }, replaceUrl: true });
  }

  protected descargar(tipo: 'lecturas' | 'alimentaciones'): void {
    const r = this.reporte();
    const pecera = this.seleccionada();
    if (!r || !pecera) {
      return;
    }
    const contenido =
      tipo === 'lecturas' ? csvLecturas(r.lecturas) : csvAlimentaciones(r.alimentaciones);
    const nombre = pecera.dispositivo.nombre
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `aquafeed-${nombre}-${tipo}-${r.dias}d.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  protected numero(valor: number, decimales: number): string {
    return valor.toLocaleString('es-AR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
    });
  }

  private textoRango(parametro: Parametro): string | null {
    const rangos = rangosDe(this.especie(), parametro);
    const p = PARAMETROS.find((x) => x.clave === parametro);
    if (!rangos || !p) {
      return null;
    }
    const { min, max } = rangos.ideal.intervalo;
    const u = p.unidad ? ` ${p.unidad}` : '';
    const f = (v: number): string => this.numero(v, parametro === 'ph' ? 1 : 0);
    if (min !== null && max !== null) {
      return `${f(min)}–${f(max)}${u}`;
    }
    if (max !== null) {
      return `hasta ${f(max)}${u}`;
    }
    return min !== null ? `desde ${f(min)}${u}` : null;
  }
}
