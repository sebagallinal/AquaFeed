import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API, type AlertaVista } from '../../../shared/data/datos-api';
import { fechaHora } from '../../../shared/formato';

@Component({
  selector: 'app-alertas',
  imports: [RouterLink],
  templateUrl: './alertas.html',
})
export class Alertas {
  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly alertas = signal<AlertaVista[]>([]);
  protected readonly fechaHora = fechaHora;
  /** Abiertas y reconocidas: siguen pasando. */
  protected readonly actuales = computed(() =>
    this.alertas().filter((a) => a.estado !== 'cerrada'),
  );
  protected readonly historial = computed(() =>
    this.alertas().filter((a) => a.estado === 'cerrada'),
  );

  constructor() {
    const id = this.auth.usuario()?.id ?? '';
    const sub = this.datos.alertasDe(id).subscribe((lista) => this.alertas.set(lista));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected reconocer(alerta: AlertaVista): void {
    this.datos.reconocerAlerta(alerta.id, this.auth.usuario()?.id ?? '').subscribe({
      next: () => {
        // Se marca enseguida; el próximo refresco lo confirma
        this.alertas.update((lista) =>
          lista.map((a) => (a.id === alerta.id ? { ...a, estado: 'reconocida' } : a)),
        );
        this.snack.open('Alerta reconocida.', 'Cerrar', { duration: 4000 });
      },
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
      return 'Vista, sigue pasando';
    }
    return 'Resuelta';
  }
}
