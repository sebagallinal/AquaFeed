import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DATOS_API } from '../../../shared/data/datos-api';
import type { PerfilEspecie } from '../../../shared/models/perfil-especie.model';
import { FichaEspecie } from '../../../shared/ui/ficha-especie/ficha-especie';

@Component({
  selector: 'app-especie-admin',
  imports: [RouterLink, FichaEspecie],
  templateUrl: './especie.html',
})
export class EspecieAdmin {
  readonly id = input.required<string>();

  private readonly datos = inject(DATOS_API);
  protected readonly especie = signal<PerfilEspecie | null | undefined>(undefined);

  constructor() {
    effect((onCleanup) => {
      const sub = this.datos.especies().subscribe((lista) => {
        this.especie.set(lista.find((item) => item.id === this.id()) ?? null);
      });
      onCleanup(() => sub.unsubscribe());
    });
  }
}
