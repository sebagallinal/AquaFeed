import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DATOS_API, type DispositivoAdmin } from '../../../shared/data/datos-api';
import { fechaHora } from '../../../shared/formato';
import type { Usuario } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-dispositivo-admin',
  imports: [RouterLink],
  templateUrl: './dispositivo.html',
})
export class DispositivoAdminPage {
  readonly id = input.required<string>();

  private readonly datos = inject(DATOS_API);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dispositivo = signal<DispositivoAdmin | null | undefined>(undefined);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly fechaHora = fechaHora;

  /** Dueño elegido en el select; null mientras no se toca (se muestra el actual). */
  protected readonly elegido = signal<string | null>(null);
  protected readonly guardando = signal(false);
  protected readonly aviso = signal<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  protected readonly activos = computed(() =>
    this.usuarios()
      .filter((u) => u.activo)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
  );
  protected readonly dueno = computed(() => this.elegido() ?? this.dispositivo()?.ownerId ?? '');
  protected readonly cambio = computed(
    () => this.elegido() !== null && this.elegido() !== (this.dispositivo()?.ownerId ?? ''),
  );

  constructor() {
    effect((onCleanup) => {
      const sub = this.datos
        .dispositivoAdmin(this.id())
        .subscribe((valor) => this.dispositivo.set(valor));
      onCleanup(() => sub.unsubscribe());
    });
    const sub = this.datos.usuarios().subscribe((lista) => this.usuarios.set(lista));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected guardar(): void {
    if (!this.cambio() || this.guardando()) {
      return;
    }
    const usuarioId = this.elegido() || null;
    this.guardando.set(true);
    this.aviso.set(null);
    this.datos.asignarDispositivo(this.id(), usuarioId).subscribe({
      next: (d) => {
        this.guardando.set(false);
        this.dispositivo.set(d);
        this.elegido.set(null);
        this.aviso.set({
          tipo: 'ok',
          texto: usuarioId ? `Ahora es de ${d.duenoNombre}.` : 'Quedó sin dueño.',
        });
      },
      error: (e: unknown) => {
        this.guardando.set(false);
        this.aviso.set({
          tipo: 'error',
          texto: e instanceof Error ? e.message : 'No se pudo cambiar el dueño.',
        });
      },
    });
  }
}
