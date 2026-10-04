import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API, type PeceraDetalle } from '../../../shared/data/datos-api';
import { etiquetaDia, textoPorciones } from '../../../shared/formato';

@Component({
  selector: 'app-horarios',
  imports: [RouterLink],
  templateUrl: './horarios.html',
})
export class Horarios {
  readonly id = input.required<string>();

  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);

  protected readonly detalle = signal<PeceraDetalle | null | undefined>(undefined);
  protected readonly etiquetaDia = etiquetaDia;
  protected readonly textoPorciones = textoPorciones;

  constructor() {
    effect((onCleanup) => {
      const sub = this.datos
        .pecera(this.id(), this.auth.usuario()?.id ?? '')
        .subscribe((valor) => this.detalle.set(valor));
      onCleanup(() => sub.unsubscribe());
    });
  }
}
