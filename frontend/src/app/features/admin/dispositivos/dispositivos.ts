import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ID_DISPOSITIVO, normalizarIdDispositivo } from '../../../shared/clave';
import { DATOS_API, type DispositivoAdmin } from '../../../shared/data/datos-api';
import type { Usuario } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-dispositivos-admin',
  imports: [RouterLink],
  templateUrl: './dispositivos.html',
})
export class DispositivosAdmin {
  private readonly datos = inject(DATOS_API);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dispositivos = signal<DispositivoAdmin[]>([]);
  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly activos = computed(() =>
    this.usuarios()
      .filter((u) => u.activo)
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
  );

  // Alta de una placa
  protected readonly abierto = signal(false);
  protected readonly id = signal('');
  protected readonly nombre = signal('');
  protected readonly dueno = signal('');
  protected readonly intentado = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly registrada = signal<DispositivoAdmin | null>(null);

  protected readonly error = computed(() => {
    const id = normalizarIdDispositivo(this.id());
    if (!ID_DISPOSITIVO.test(id)) {
      return 'El ID es af- seguido de los 12 caracteres de la MAC (sale en el monitor serie).';
    }
    if (this.dispositivos().some((d) => d.id === id)) {
      return 'Esa placa ya está registrada: asignala desde su ficha.';
    }
    return this.nombre().trim().length > 60 ? 'El nombre puede tener hasta 60 caracteres.' : null;
  });

  constructor() {
    const sub = this.datos.dispositivosAdmin().subscribe((lista) => this.dispositivos.set(lista));
    const subUsuarios = this.datos.usuarios().subscribe((lista) => this.usuarios.set(lista));
    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
      subUsuarios.unsubscribe();
    });
  }

  protected abrir(): void {
    this.registrada.set(null);
    this.abierto.set(true);
  }

  protected cancelar(): void {
    this.abierto.set(false);
    this.limpiar();
  }

  protected registrar(): void {
    this.intentado.set(true);
    if (this.error() || this.guardando()) {
      return;
    }
    this.guardando.set(true);
    this.errorServidor.set(null);
    this.datos
      .registrarDispositivo({
        id: normalizarIdDispositivo(this.id()),
        nombre: this.nombre().trim() || undefined,
        usuarioId: this.dueno() || null,
      })
      .subscribe({
        next: (d) => {
          this.guardando.set(false);
          this.registrada.set(d);
          this.dispositivos.update((lista) => [...lista.filter((x) => x.id !== d.id), d]);
          this.abierto.set(false);
          this.limpiar();
        },
        error: (e: unknown) => {
          this.guardando.set(false);
          this.errorServidor.set(
            e instanceof Error ? e.message : 'No se pudo registrar el dispositivo.',
          );
        },
      });
  }

  private limpiar(): void {
    this.id.set('');
    this.nombre.set('');
    this.dueno.set('');
    this.intentado.set(false);
    this.errorServidor.set(null);
  }
}
