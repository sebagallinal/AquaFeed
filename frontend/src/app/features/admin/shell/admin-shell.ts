import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API } from '../../../shared/data/datos-api';
import { Marco, type ItemNav } from '../../../shared/ui/marco/marco';

@Component({
  selector: 'app-admin-shell',
  imports: [Marco, RouterOutlet],
  templateUrl: './admin-shell.html',
})
export class AdminShell {
  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly usuario = this.auth.usuario;
  private readonly abiertas = signal(0);
  protected readonly items = computed<ItemNav[]>(() => [
    { etiqueta: 'Resumen', ruta: '/admin', icono: 'monitoring', exacta: true },
    { etiqueta: 'Usuarios', ruta: '/admin/usuarios', icono: 'group' },
    { etiqueta: 'Dispositivos', ruta: '/admin/dispositivos', icono: 'devices' },
    { etiqueta: 'Especies', ruta: '/admin/especies', icono: 'menu_book' },
    {
      etiqueta: 'Alertas y salud',
      ruta: '/admin/alertas',
      icono: 'health_and_safety',
      badge: this.abiertas(),
    },
  ]);

  constructor() {
    const sub = this.datos.alertasAdmin().subscribe((lista) => {
      this.abiertas.set(lista.filter((alerta) => alerta.estado === 'abierta').length);
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected salir(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
