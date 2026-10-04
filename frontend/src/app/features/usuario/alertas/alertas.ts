import { Component, DestroyRef, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API, type AlertaVista } from '../../../shared/data/datos-api';
import { fechaHora } from '../../../shared/formato';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.html',
})
export class Alertas {
  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly alertas = signal<AlertaVista[]>([]);
  protected readonly fechaHora = fechaHora;

  constructor() {
    const id = this.auth.usuario()?.id ?? '';
    const sub = this.datos.alertasDe(id).subscribe((lista) => this.alertas.set(lista));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected reconocer(alerta: AlertaVista): void {
    this.datos.reconocerAlerta(alerta.id, this.auth.usuario()?.id ?? '').subscribe({
      next: () => this.snack.open('Alerta reconocida (simulado).', 'Cerrar', { duration: 4000 }),
      error: (error: unknown) => {
        const mensaje = error instanceof Error ? error.message : 'No se pudo reconocer la alerta.';
        this.snack.open(mensaje, 'Cerrar', { duration: 4000 });
      },
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
