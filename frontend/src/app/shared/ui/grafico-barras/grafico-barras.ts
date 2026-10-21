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

import type { OrigenAlimentacion } from '../../models/reporte.model';
import { ORIGENES, type DiaAlimentacion } from '../../reportes';
import { escalaLimpia } from '../graficos';

const ALTO = 200;
const M = { arriba: 12, derecha: 8, abajo: 26, izquierda: 32 };
const ANCHO_MAX_BARRA = 24;
const SEPARACION = 2;

interface Segmento {
  origen: OrigenAlimentacion;
  y: number;
  alto: number;
  /** Solo el segmento de arriba lleva el extremo redondeado. */
  d: string;
}

interface Columna {
  dia: DiaAlimentacion;
  x: number;
  centro: number;
  segmentos: Segmento[];
}

/** Tomas por día, apiladas por origen (programada, web, botón). */
@Component({
  selector: 'app-grafico-barras',
  templateUrl: './grafico-barras.html',
  host: { class: 'af-chart' },
})
export class GraficoBarras {
  readonly dias = input.required<readonly DiaAlimentacion[]>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly ancho = signal(640);
  protected readonly alto = ALTO;
  protected readonly m = M;
  protected readonly origenes = ORIGENES;
  protected readonly activo = signal<number | null>(null);

  protected readonly escala = computed(() =>
    escalaLimpia(0, Math.max(4, ...this.dias().map((d) => d.tomas)), 5),
  );

  protected readonly columnas = computed<Columna[]>(() => {
    const dias = this.dias();
    const util = this.ancho() - M.izquierda - M.derecha;
    const banda = util / Math.max(1, dias.length);
    const barra = Math.max(3, Math.min(ANCHO_MAX_BARRA, banda * 0.6));
    return dias.map((dia, i) => {
      const centro = M.izquierda + banda * (i + 0.5);
      const x = centro - barra / 2;
      let base = this.y(0);
      const conDatos = ORIGENES.filter((o) => dia[o.clave] > 0);
      const segmentos = conDatos.map((o, j) => {
        const alto = this.y(0) - this.y(dia[o.clave]);
        // El hueco de 2 px entre segmentos sale del segmento de arriba
        const altoVisible = Math.max(1, alto - (j > 0 ? SEPARACION : 0));
        const y = base - alto;
        base = y;
        const ultimo = j === conDatos.length - 1;
        return {
          origen: o.clave,
          y,
          alto: altoVisible,
          d: rectangulo(x, y, barra, altoVisible, ultimo ? Math.min(4, barra / 2, altoVisible) : 0),
        };
      });
      return { dia, x, centro, segmentos };
    });
  });

  /** Con muchos días se rotula uno cada tanto para que las fechas no se pisen. */
  protected readonly cadaCuanto = computed(() => {
    const util = this.ancho() - M.izquierda - M.derecha;
    return Math.max(1, Math.ceil(this.dias().length / Math.max(1, Math.floor(util / 46))));
  });

  protected readonly detalle = computed(() => {
    const i = this.activo();
    const col = i === null ? null : this.columnas()[i];
    if (!col) {
      return null;
    }
    return { col, izquierda: col.centro > this.ancho() * 0.6 };
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observador = new ResizeObserver(([entrada]) => {
        this.ancho.set(Math.max(280, Math.floor(entrada.contentRect.width)));
      });
      observador.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }

  protected y(v: number): number {
    const e = this.escala();
    return M.arriba + (1 - (v - e.min) / (e.max - e.min)) * (ALTO - M.arriba - M.abajo);
  }

  protected banda(): number {
    return (this.ancho() - M.izquierda - M.derecha) / Math.max(1, this.dias().length);
  }

  protected teclado(evento: KeyboardEvent): void {
    const total = this.dias().length;
    const actual = this.activo() ?? total - 1;
    if (evento.key === 'ArrowLeft') {
      this.activo.set(Math.max(0, actual - 1));
    } else if (evento.key === 'ArrowRight') {
      this.activo.set(Math.min(total - 1, actual + 1));
    } else if (evento.key === 'Escape') {
      this.activo.set(null);
      return;
    } else {
      return;
    }
    evento.preventDefault();
  }

  protected enfocar(): void {
    if (this.activo() === null && this.dias().length) {
      this.activo.set(this.dias().length - 1);
    }
  }
}

/** Rectángulo con las dos esquinas de arriba redondeadas y la base recta. */
function rectangulo(x: number, y: number, ancho: number, alto: number, radio: number): string {
  if (radio <= 0) {
    return `M${x},${y}h${ancho}v${alto}h${-ancho}Z`;
  }
  return (
    `M${x},${y + alto}V${y + radio}Q${x},${y} ${x + radio},${y}` +
    `H${x + ancho - radio}Q${x + ancho},${y} ${x + ancho},${y + radio}V${y + alto}Z`
  );
}
