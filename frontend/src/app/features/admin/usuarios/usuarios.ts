import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DATOS_API } from '../../../shared/data/datos-api';
import type { Usuario } from '../../../shared/models/usuario.model';

@Component({
  selector: 'app-usuarios-admin',
  imports: [RouterLink],
  templateUrl: './usuarios.html',
})
export class UsuariosAdmin {
  private readonly datos = inject(DATOS_API);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly usuarios = signal<Usuario[]>([]);

  constructor() {
    const sub = this.datos.usuarios().subscribe((lista) => this.usuarios.set(lista));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected etiquetaRol(rol: Usuario['rol']): string {
    return rol === 'admin' ? 'Admin' : 'Usuario';
  }
}
