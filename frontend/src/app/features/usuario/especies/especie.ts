import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DATOS_API } from '../../../shared/data/datos-api';
import type { PerfilEspecie } from '../../../shared/models/perfil-especie.model';
import { FichaEspecie } from '../../../shared/ui/ficha-especie/ficha-especie';

@Component({
  selector: 'app-especie',
  imports: [RouterLink, FichaEspecie],
  templateUrl: './especie.html',
})
export class Especie {
  readonly slug = input.required<string>();

  private readonly datos = inject(DATOS_API);
  protected readonly especie = signal<PerfilEspecie | null | undefined>(undefined);

  constructor() {
    effect((onCleanup) => {
      const sub = this.datos.especie(this.slug()).subscribe((valor) => this.especie.set(valor));
      onCleanup(() => sub.unsubscribe());
    });
  }
}
