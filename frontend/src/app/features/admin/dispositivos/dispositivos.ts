import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DATOS_API, type DispositivoAdmin } from '../../../shared/data/datos-api';

@Component({
  selector: 'app-dispositivos-admin',
  imports: [RouterLink],
  templateUrl: './dispositivos.html',
})
export class DispositivosAdmin {
  private readonly datos = inject(DATOS_API);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dispositivos = signal<DispositivoAdmin[]>([]);

  constructor() {
    const sub = this.datos.dispositivosAdmin().subscribe((lista) => this.dispositivos.set(lista));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
