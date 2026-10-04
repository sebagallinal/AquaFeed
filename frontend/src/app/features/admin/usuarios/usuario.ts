import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DATOS_API } from '../../../shared/data/datos-api';
import type { Usuario } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-usuario-admin',
  imports: [RouterLink],
  templateUrl: './usuario.html',
})
export class UsuarioAdmin {
  readonly id = input.required<string>();

  private readonly datos = inject(DATOS_API);
  protected readonly usuario = signal<Usuario | null | undefined>(undefined);

  constructor() {
    effect((onCleanup) => {
      const sub = this.datos.usuario(this.id()).subscribe((valor) => this.usuario.set(valor));
      onCleanup(() => sub.unsubscribe());
    });
  }
}
