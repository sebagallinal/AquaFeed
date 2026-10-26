import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API } from '../../../shared/data/datos-api';
import type { NuevaPlantilla } from '../../../shared/especies/plantillas';
import type { TipoAgua } from '../../../shared/models/perfil-especie.model';

@Component({
  selector: 'app-plantilla',
  imports: [RouterLink],
  templateUrl: './plantilla.html',
})
export class Plantilla {
  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);
  private readonly router = inject(Router);

  protected readonly nombre = signal('');
  protected readonly tipoAgua = signal<TipoAgua>('tropical');
  protected readonly tempMin = signal('24');
  protected readonly tempMax = signal('28');
  protected readonly phMin = signal('6.5');
  protected readonly phMax = signal('7.5');
  protected readonly tdsMax = signal('');
  protected readonly porciones = signal('');
  protected readonly tomasPorDia = signal('');
  protected readonly foto = signal<string | null>(null);
  protected readonly nombreArchivo = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly guardando = signal(false);

  protected guardar(): void {
    const datos = this.datosFormulario();
    if (!datos) {
      return;
    }
    this.guardando.set(true);
    this.error.set(null);
    this.datos.crearPlantilla(this.auth.usuario()?.id ?? '', datos).subscribe({
      next: (perfil) => void this.router.navigate(['/app/especies', perfil.slug]),
      error: (error: unknown) => {
        this.guardando.set(false);
        this.error.set(error instanceof Error ? error.message : 'No se pudo agregar la especie.');
      },
    });
  }

  private datosFormulario(): NuevaPlantilla | null {
    const tempMin = numero(this.tempMin());
    const tempMax = numero(this.tempMax());
    const phMin = numero(this.phMin());
    const phMax = numero(this.phMax());
    if (tempMin === null || tempMax === null || phMin === null || phMax === null) {
      this.error.set('Completá la temperatura y el pH.');
      return null;
    }
    const tds = this.tdsMax().trim() ? numero(this.tdsMax()) : null;
    const porciones = this.porciones().trim() ? numero(this.porciones()) : null;
    const tomas = this.tomasPorDia().trim() ? numero(this.tomasPorDia()) : null;
    if (tds === null && this.tdsMax().trim()) {
      this.error.set('El TDS máximo no es un número.');
      return null;
    }
    return {
      nombre: this.nombre(),
      tipoAgua: this.tipoAgua(),
      tempMin,
      tempMax,
      phMin,
      phMax,
      tdsMax: tds,
      porciones,
      tomasPorDia: tomas,
      fotoSrc: this.foto(),
    };
  }

  protected async elegirFoto(evento: Event): Promise<void> {
    const campo = evento.target;
    if (!(campo instanceof HTMLInputElement)) {
      return;
    }
    const archivo = campo.files?.[0];
    if (!archivo) {
      this.foto.set(null);
      this.nombreArchivo.set('');
      return;
    }
    this.nombreArchivo.set(archivo.name);
    if (!archivo.type.startsWith('image/')) {
      this.foto.set(null);
      this.nombreArchivo.set('');
      campo.value = '';
      this.error.set('La foto tiene que ser una imagen.');
      return;
    }
    try {
      this.foto.set(await reducirImagen(archivo));
      this.error.set(null);
    } catch {
      this.foto.set(null);
      this.nombreArchivo.set('');
      campo.value = '';
      this.error.set('No pudimos usar esa imagen. Probá con una foto más chica.');
    }
  }

  protected quitarFoto(campo: HTMLInputElement): void {
    campo.value = '';
    this.foto.set(null);
    this.nombreArchivo.set('');
  }
}

function numero(texto: string): number | null {
  const valor = Number(texto.trim().replace(',', '.'));
  return Number.isFinite(valor) ? valor : null;
}

/** Achica la foto para poder guardarla en el navegador junto con la especie. */
function reducirImagen(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () => {
      URL.revokeObjectURL(url);
      if (!imagen.width || !imagen.height) {
        reject(new Error('imagen'));
        return;
      }
      let maximo = 960;
      let calidad = 0.72;
      let resultado = dibujar(imagen, maximo, calidad);
      for (let intento = 0; resultado.length > 500_000 && intento < 3; intento++) {
        maximo = Math.round(maximo * 0.7);
        calidad = 0.6;
        resultado = dibujar(imagen, maximo, calidad);
      }
      if (resultado.length > 500_000) {
        reject(new Error('grande'));
        return;
      }
      resolve(resultado);
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('imagen'));
    };
    imagen.src = url;
  });
}

function dibujar(imagen: HTMLImageElement, maximo: number, calidad: number): string {
  const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.max(1, Math.round(imagen.width * escala));
  lienzo.height = Math.max(1, Math.round(imagen.height * escala));
  const ctx = lienzo.getContext('2d');
  if (!ctx) {
    return '';
  }
  ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  return lienzo.toDataURL('image/jpeg', calidad);
}
