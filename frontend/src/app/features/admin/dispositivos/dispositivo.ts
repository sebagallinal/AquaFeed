import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DATOS_API, type DispositivoAdmin } from '../../../shared/data/datos-api';
import { fechaHora } from '../../../shared/formato';

@Component({
  selector: 'app-dispositivo-admin',
  imports: [RouterLink],
  templateUrl: './dispositivo.html',
})
export class DispositivoAdminPage {
  readonly id = input.required<string>();

  private readonly datos = inject(DATOS_API);
  protected readonly dispositivo = signal<DispositivoAdmin | null | undefined>(undefined);
  protected readonly fechaHora = fechaHora;

  constructor() {
    effect((onCleanup) => {
      const sub = this.datos
        .dispositivoAdmin(this.id())
        .subscribe((valor) => this.dispositivo.set(valor));
      onCleanup(() => sub.unsubscribe());
    });
  }
}
