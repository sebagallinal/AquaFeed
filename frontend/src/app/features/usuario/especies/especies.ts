import { Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API } from '../../../shared/data/datos-api';
import type { PerfilEspecie } from '../../../shared/models/perfil-especie.model';
import { ListaEspecies } from '../../../shared/ui/lista-especies/lista-especies';

@Component({
  selector: 'app-especies',
  imports: [ListaEspecies, RouterLink],
  templateUrl: './especies.html',
})
export class Especies {
  private readonly datos = inject(DATOS_API);
  private readonly auth = inject(AUTH_API);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly especies = signal<PerfilEspecie[]>([]);

  constructor() {
    const sub = forkJoin({
      catalogo: this.datos.especies(),
      plantillas: this.datos.plantillasDe(this.auth.usuario()?.id ?? ''),
    }).subscribe(({ catalogo, plantillas }) => this.especies.set([...plantillas, ...catalogo]));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
