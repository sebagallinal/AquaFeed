import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DATOS_API, type ResumenAdmin } from '../../../shared/data/datos-api';

@Component({
  selector: 'app-resumen-admin',
  imports: [RouterLink],
  templateUrl: './resumen.html',
})
export class ResumenAdminPage {
  private readonly datos = inject(DATOS_API);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly resumen = signal<ResumenAdmin | null>(null);

  constructor() {
    const sub = this.datos.resumenAdmin().subscribe((valor) => this.resumen.set(valor));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
