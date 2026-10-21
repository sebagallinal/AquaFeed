import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import type { RangosEspecie } from '../../models/perfil-especie.model';
import { escalaLimpia, ticksTiempo } from '../graficos';

export interface PuntoSerie {
  /** Epoch en segundos. */
  t: number;
  v: number | null;
}

const ALTO = 220;
const M = { arriba: 12, derecha: 14, abajo: 26, izquierda: 44 };
/** Más de 15 minutos sin lectura corta la línea: no se inventa lo que no se midió. */
const HUECO_S = 15 * 60;
const MAX_PUNTOS = 720;

/**
 * Serie temporal de un parámetro con la banda ideal de la especie y los límites críticos.
 * Una sola serie: el título de la tarjeta la nombra, no lleva leyenda de serie.
 */
@Component({
  selector: 'app-grafico-linea',
  templateUrl: './grafico-linea.html',
  host: { class: 'af-chart' },
})
export class GraficoLinea {
  readonly puntos = input.required<readonly PuntoSerie[]>();
  readonly desde = input.required<number>();
  readonly hasta = input.required<number>();
  readonly rangos = input<RangosEspecie | null>(null);
  readonly unidad = input('');
  readonly decimales = input(1);
  readonly nombre = input.required<string>();
  /** Texto del rango ideal para la leyenda, por ejemplo «22–28 °C». */
  readonly textoRango = input<string | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly ancho = signal(640);
  protected readonly alto = ALTO;
  protected readonly m = M;
  protected readonly activo = signal<number | null>(null);

  /** Promedia de a tramos cuando hay más puntos que píxeles útiles. */
  protected readonly serie = computed<PuntoSerie[]>(() => {
    const puntos = this.puntos();
    if (puntos.length <= MAX_PUNTOS) {
      return [...puntos];
    }
    const tramo = Math.ceil(puntos.length / MAX_PUNTOS);
    const salida: PuntoSerie[] = [];
    for (let i = 0; i < puntos.length; i += tramo) {
      const grupo = puntos.slice(i, i + tramo);
      const valores = grupo.map((p) => p.v).filter((v): v is number => v !== null);
      salida.push({
        t: grupo[Math.floor(grupo.length / 2)].t,
        v: valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : null,
      });
    }
    return salida;
  });

  private readonly limites = computed(() => {
    const r = this.rangos();
    return {
      idealMin: r?.ideal.intervalo.min ?? null,
      idealMax: r?.ideal.intervalo.max ?? null,
      criticoBajo: r?.critico.umbral.bajo ?? null,
      criticoAlto: r?.critico.umbral.alto ?? null,
    };
  });

  protected readonly escalaY = computed(() => {
    const valores = this.serie()
      .map((p) => p.v)
      .filter((v): v is number => v !== null);
    const { idealMin, idealMax } = this.limites();
    // La banda ideal entra en la escala, así se ve cuánto falta para salir de ella
    const extremos = [...valores, idealMin, idealMax].filter((v): v is number => v !== null);
    if (extremos.length === 0) {
      return escalaLimpia(0, 1);
    }
    return escalaLimpia(Math.min(...extremos), Math.max(...extremos));
  });

  protected readonly ticksX = computed(() =>
    ticksTiempo(this.desde(), this.hasta(), this.ancho() - M.izquierda - M.derecha),
  );

  protected readonly path = computed(() => {
    let d = '';
    let anterior: PuntoSerie | null = null;
    for (const p of this.serie()) {
      if (p.v === null) {
        anterior = null;
        continue;
      }
      const corte = anterior === null || p.t - anterior.t > HUECO_S * Math.max(1, this.tramo());
      d += `${corte ? 'M' : 'L'}${this.x(p.t).toFixed(1)},${this.y(p.v).toFixed(1)}`;
      anterior = p;
    }
    return d;
  });

  protected readonly banda = computed(() => {
    const { idealMin, idealMax } = this.limites();
    if (idealMin === null && idealMax === null) {
      return null;
    }
    const e = this.escalaY();
    const arriba = this.y(Math.min(idealMax ?? e.max, e.max));
    const abajo = this.y(Math.max(idealMin ?? e.min, e.min));
    return { y: arriba, alto: Math.max(0, abajo - arriba) };
  });

  protected readonly lineasCriticas = computed(() => {
    const e = this.escalaY();
    const { criticoBajo, criticoAlto } = this.limites();
    return [criticoBajo, criticoAlto]
      .filter((v): v is number => v !== null && v >= e.min && v <= e.max)
      .map((v) => this.y(v));
  });

  protected readonly sinDatos = computed(() => this.serie().every((p) => p.v === null));

  protected readonly punto = computed(() => {
    const i = this.activo();
    const p = i === null ? null : this.serie()[i];
    if (!p) {
      return null;
    }
    const x = this.x(p.t);
    return {
      x,
      y: p.v === null ? null : this.y(p.v),
      valor:
        p.v === null
          ? 'Sin dato'
          : `${this.formato(p.v)}${this.unidad() ? ' ' + this.unidad() : ''}`,
      fecha: new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(p.t * 1000)),
      // El tooltip se da vuelta cerca del borde derecho
      izquierda: x > this.ancho() * 0.6,
    };
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    // Se dibuja al ancho real de la tarjeta para que el texto no se deforme
    afterNextRender(() => {
      const observador = new ResizeObserver(([entrada]) => {
        this.ancho.set(Math.max(280, Math.floor(entrada.contentRect.width)));
      });
      observador.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }

  protected x(t: number): number {
    const rango = Math.max(1, this.hasta() - this.desde());
    return M.izquierda + ((t - this.desde()) / rango) * (this.ancho() - M.izquierda - M.derecha);
  }

  protected y(v: number): number {
    const e = this.escalaY();
    return M.arriba + (1 - (v - e.min) / (e.max - e.min)) * (ALTO - M.arriba - M.abajo);
  }

  protected formato(v: number): string {
    return v.toLocaleString('es-AR', {
      minimumFractionDigits: this.decimales(),
      maximumFractionDigits: this.decimales(),
    });
  }

  protected mover(evento: PointerEvent): void {
    const svg = evento.currentTarget as SVGElement;
    const caja = svg.getBoundingClientRect();
    const t =
      this.desde() +
      ((evento.clientX - caja.left - M.izquierda) / (this.ancho() - M.izquierda - M.derecha)) *
        (this.hasta() - this.desde());
    this.activo.set(this.masCercano(t));
  }

  protected teclado(evento: KeyboardEvent): void {
    const total = this.serie().length;
    if (total === 0) {
      return;
    }
    const actual = this.activo() ?? total - 1;
    const salto = evento.shiftKey ? 12 : 1;
    if (evento.key === 'ArrowLeft') {
      this.activo.set(Math.max(0, actual - salto));
    } else if (evento.key === 'ArrowRight') {
      this.activo.set(Math.min(total - 1, actual + salto));
    } else if (evento.key === 'Escape') {
      this.activo.set(null);
      return;
    } else {
      return;
    }
    evento.preventDefault();
  }

  protected enfocar(): void {
    if (this.activo() === null && this.serie().length) {
      this.activo.set(this.serie().length - 1);
    }
  }

  private tramo(): number {
    return Math.max(1, Math.ceil(this.puntos().length / MAX_PUNTOS));
  }

  private masCercano(t: number): number | null {
    const serie = this.serie();
    if (serie.length === 0) {
      return null;
    }
    let bajo = 0;
    let alto = serie.length - 1;
    while (bajo < alto) {
      const medio = (bajo + alto) >> 1;
      if (serie[medio].t < t) {
        bajo = medio + 1;
      } else {
        alto = medio;
      }
    }
    if (bajo > 0 && Math.abs(serie[bajo - 1].t - t) < Math.abs(serie[bajo].t - t)) {
      return bajo - 1;
    }
    return bajo;
  }
}
