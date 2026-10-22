import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API, type PeceraDetalle } from '../../../shared/data/datos-api';
import { CONFIG_ALERTAS_DEFECTO, type ConfigAlertas } from '../../../shared/models/alerta.model';
import { CLAVES_SENSOR, rangoIdeal } from '../../../shared/alertas';
import type { Parametro } from '../../../shared/reportes';

interface Sensor {
  clave: Parametro;
  nombre: string;
  unidad: string;
  paso: number;
  min: 'tempMin' | 'phMin' | 'tdsMin';
  max: 'tempMax' | 'phMax' | 'tdsMax';
  lectura: 'waterTempC' | 'ph' | 'tdsPpm';
  decimales: number;
}

const SENSORES: readonly Sensor[] = [
  {
    clave: 'temp',
    nombre: 'Temperatura',
    unidad: '°C',
    paso: 0.5,
    min: 'tempMin',
    max: 'tempMax',
    lectura: 'waterTempC',
    decimales: 1,
  },
  {
    clave: 'ph',
    nombre: 'pH',
    unidad: '',
    paso: 0.1,
    min: 'phMin',
    max: 'phMax',
    lectura: 'ph',
    decimales: 2,
  },
  {
    clave: 'tds',
    nombre: 'TDS',
    unidad: 'ppm',
    paso: 10,
    min: 'tdsMin',
    max: 'tdsMax',
    lectura: 'tdsPpm',
    decimales: 0,
  },
];

const MINUTOS_DESCONEXION = [5, 10, 15, 30, 60, 120];

/** Lo que se está editando de un sensor: los campos quedan como texto mientras se tipea. */
interface Fila {
  activo: boolean;
  /** true: usa el rango ideal de la especie y lo sigue si se cambia de especie. */
  especie: boolean;
  min: string;
  max: string;
}

@Component({
  selector: 'app-alertas-pecera',
  imports: [RouterLink],
  templateUrl: './alertas-pecera.html',
})
export class AlertasPecera {
  readonly id = input.required<string>();

  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);

  protected readonly sensores = SENSORES;
  protected readonly minutos = MINUTOS_DESCONEXION;
  protected readonly detalle = signal<PeceraDetalle | null | undefined>(undefined);
  protected readonly cargada = signal(false);
  protected readonly filas = signal<Record<Parametro, Fila>>({
    temp: { activo: false, especie: false, min: '', max: '' },
    ph: { activo: false, especie: false, min: '', max: '' },
    tds: { activo: false, especie: false, min: '', max: '' },
  });
  protected readonly offlineActivo = signal(true);
  protected readonly offlineMin = signal(10);
  protected readonly tocado = signal(false);
  protected readonly guardando = signal(false);
  protected readonly aviso = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  protected readonly especie = computed(() => this.detalle()?.especie ?? null);

  /** Primer problema del formulario, o null si se puede guardar. */
  protected readonly error = computed(() => {
    for (const s of SENSORES) {
      const fila = this.filas()[s.clave];
      if (!fila.activo) {
        continue;
      }
      if (fila.especie) {
        if (!this.rangoEspecie(s.clave)) {
          const e = this.especie();
          return e
            ? `${s.nombre}: la ficha de ${e.nombre} no trae un rango. Elegí «Personalizado».`
            : `${s.nombre}: la pecera no tiene especie. Elegí «Personalizado».`;
        }
        continue;
      }
      const min = aNumero(fila.min);
      const max = aNumero(fila.max);
      if (min === undefined || max === undefined) {
        return `${s.nombre}: escribí un número válido.`;
      }
      if (min === null && max === null) {
        return `${s.nombre}: poné al menos un mínimo o un máximo.`;
      }
      if (min !== null && max !== null && min >= max) {
        return `${s.nombre}: el mínimo tiene que ser menor que el máximo.`;
      }
    }
    return null;
  });

  constructor() {
    effect((onCleanup) => {
      const usuarioId = this.auth.usuario()?.id ?? '';
      const sub = this.datos.pecera(this.id(), usuarioId).subscribe((d) => this.detalle.set(d));
      const subConfig = this.datos.configAlertas(this.id(), usuarioId).subscribe({
        next: (config) => {
          this.cargar(config);
          this.cargada.set(true);
        },
        error: () => {
          this.cargar(CONFIG_ALERTAS_DEFECTO);
          this.cargada.set(true);
        },
      });
      onCleanup(() => {
        sub.unsubscribe();
        subConfig.unsubscribe();
      });
    });
  }

  protected fila(clave: Parametro): Fila {
    return this.filas()[clave];
  }

  protected cambiar(clave: Parametro, cambio: Partial<Fila>): void {
    this.tocado.set(true);
    this.aviso.set(null);
    this.filas.update((f) => ({ ...f, [clave]: { ...f[clave], ...cambio } }));
  }

  /** Rango ideal de la ficha de la especie, si la ficha lo trae. */
  protected rangoEspecie(clave: Parametro): { min: number | null; max: number | null } | null {
    return rangoIdeal(this.especie(), clave);
  }

  /** Al pasar a «Personalizado» sin números cargados, se parte del rango de la especie. */
  protected elegirModo(clave: Parametro, especie: boolean): void {
    const rango = this.rangoEspecie(clave);
    const fila = this.fila(clave);
    const vacio = fila.min.trim() === '' && fila.max.trim() === '';
    this.cambiar(clave, {
      especie,
      ...(!especie && vacio && rango
        ? {
            min: rango.min === null ? '' : aTexto(rango.min),
            max: rango.max === null ? '' : aTexto(rango.max),
          }
        : {}),
    });
  }

  /** Un sensor que se activa sin límites arranca siguiendo a la especie, si la ficha trae rango. */
  protected activar(clave: Parametro, activo: boolean): void {
    const fila = this.fila(clave);
    const nuevo = activo && !fila.especie && fila.min === '' && fila.max === '';
    this.cambiar(clave, {
      activo,
      ...(nuevo && this.rangoEspecie(clave) ? { especie: true } : {}),
    });
  }

  protected textoRango(clave: Parametro, unidad: string): string {
    const r = this.rangoEspecie(clave);
    if (!r) {
      return '';
    }
    const u = unidad ? ` ${unidad}` : '';
    if (r.min !== null && r.max !== null) {
      return `${formato(r.min)}–${formato(r.max)}${u}`;
    }
    return r.max !== null ? `hasta ${formato(r.max)}${u}` : `desde ${formato(r.min ?? 0)}${u}`;
  }

  protected lecturaActual(s: Sensor): string | null {
    const valor = this.detalle()?.lectura?.[s.lectura] ?? null;
    return valor === null
      ? null
      : `${formato(valor, s.decimales)}${s.unidad ? ' ' + s.unidad : ''}`;
  }

  protected textoMinutos(m: number): string {
    if (m < 60) {
      return `${m} minutos`;
    }
    return m === 60 ? '1 hora' : `${m / 60} horas`;
  }

  protected cambiarOffline(activo: boolean, minutos?: number): void {
    this.tocado.set(true);
    this.aviso.set(null);
    this.offlineActivo.set(activo);
    if (minutos !== undefined) {
      this.offlineMin.set(minutos);
    }
  }

  protected guardar(): void {
    if (this.error() || this.guardando()) {
      return;
    }
    const config: ConfigAlertas = { ...CONFIG_ALERTAS_DEFECTO };
    for (const s of SENSORES) {
      const fila = this.filas()[s.clave];
      const sigue = fila.activo && fila.especie;
      const rango = sigue ? this.rangoEspecie(s.clave) : null;
      const valor = (texto: string, deEspecie: number | null | undefined): number | null =>
        !fila.activo ? null : sigue ? (deEspecie ?? null) : (aNumero(texto) ?? null);
      config[s.min] = valor(fila.min, rango?.min);
      config[s.max] = valor(fila.max, rango?.max);
      config[CLAVES_SENSOR[s.clave].especie] = sigue;
    }
    config.offlineMin = this.offlineActivo() ? this.offlineMin() : null;

    this.guardando.set(true);
    this.datos.guardarConfigAlertas(this.id(), this.auth.usuario()?.id ?? '', config).subscribe({
      next: (guardada) => {
        this.guardando.set(false);
        this.tocado.set(false);
        this.cargar(guardada);
        this.aviso.set({
          tipo: 'ok',
          texto: 'Guardado. Las alertas aparecen en la sección Alertas cuando pase algo.',
        });
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.aviso.set({
          tipo: 'error',
          texto: error instanceof Error ? error.message : 'No se pudieron guardar las alertas.',
        });
      },
    });
  }

  private cargar(config: ConfigAlertas): void {
    const fila = (min: number | null, max: number | null, especie: boolean): Fila => ({
      activo: especie || min !== null || max !== null,
      especie,
      min: min === null ? '' : aTexto(min),
      max: max === null ? '' : aTexto(max),
    });
    this.filas.set({
      temp: fila(config.tempMin, config.tempMax, config.tempEspecie),
      ph: fila(config.phMin, config.phMax, config.phEspecie),
      tds: fila(config.tdsMin, config.tdsMax, config.tdsEspecie),
    });
    this.offlineActivo.set(config.offlineMin !== null);
    this.offlineMin.set(config.offlineMin ?? 10);
  }
}

/** Número para un campo de texto, con coma decimal. */
function aTexto(valor: number): string {
  return String(valor).replace('.', ',');
}

/** '' = sin límite (null); texto que no es número = undefined. Acepta coma decimal. */
function aNumero(texto: string): number | null | undefined {
  const limpio = texto.trim().replace(',', '.');
  if (limpio === '') {
    return null;
  }
  const valor = Number(limpio);
  return Number.isFinite(valor) ? valor : undefined;
}

function formato(valor: number, decimales?: number): string {
  return valor.toLocaleString('es-AR', {
    minimumFractionDigits: decimales ?? 0,
    maximumFractionDigits: decimales ?? 2,
  });
}
