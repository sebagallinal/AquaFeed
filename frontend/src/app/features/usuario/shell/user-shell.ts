import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API } from '../../../shared/data/datos-api';
import { Marco, type ItemNav } from '../../../shared/ui/marco/marco';

@Component({
  selector: 'app-user-shell',
  imports: [Marco, RouterOutlet],
  templateUrl: './user-shell.html',
})
export class UserShell {
  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly usuario = this.auth.usuario;
  private readonly abiertas = signal(0);
  protected readonly items = computed<ItemNav[]>(() => [
    { etiqueta: 'Mis peceras', ruta: '/app', icono: 'water_drop', exacta: true },
    { etiqueta: 'Alertas', ruta: '/app/alertas', icono: 'notifications', badge: this.abiertas() },
    { etiqueta: 'Especies', ruta: '/app/especies', icono: 'menu_book' },
  ]);

  constructor() {
    const id = this.auth.usuario()?.id ?? '';
    const sub = this.datos.alertasDe(id).subscribe((lista) => {
      this.abiertas.set(lista.filter((alerta) => alerta.estado === 'abierta').length);
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected salir(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
