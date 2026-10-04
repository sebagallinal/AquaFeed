import { Component, DestroyRef, inject, signal } from '@angular/core';

import { DATOS_API, type AlertaVista, type ResumenAdmin } from '../../../shared/data/datos-api';
import { fechaHora } from '../../../shared/formato';

@Component({
  selector: 'app-alertas-admin',
  templateUrl: './alertas.html',
})
export class AlertasAdmin {
  private readonly datos = inject(DATOS_API);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly alertas = signal<AlertaVista[]>([]);
  protected readonly resumen = signal<ResumenAdmin | null>(null);
  protected readonly fechaHora = fechaHora;

  constructor() {
    const alertas = this.datos.alertasAdmin().subscribe((lista) => this.alertas.set(lista));
    const salud = this.datos.resumenAdmin().subscribe((valor) => this.resumen.set(valor));
    this.destroyRef.onDestroy(() => {
      alertas.unsubscribe();
      salud.unsubscribe();
    });
  }

  protected etiquetaEstado(estado: AlertaVista['estado']): string {
    if (estado === 'abierta') {
      return 'Abierta';
    }
    if (estado === 'reconocida') {
      return 'Reconocida';
    }
    return 'Cerrada';
  }
}
