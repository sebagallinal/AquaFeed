import { Component, DestroyRef, inject, signal } from '@angular/core';

import { DATOS_API } from '../../../shared/data/datos-api';
import type { PerfilEspecie } from '../../../shared/models/perfil-especie.model';
import { ListaEspecies } from '../../../shared/ui/lista-especies/lista-especies';

@Component({
  selector: 'app-especies-admin',
  imports: [ListaEspecies],
  templateUrl: './especies.html',
})
export class EspeciesAdmin {
  private readonly datos = inject(DATOS_API);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly especies = signal<PerfilEspecie[]>([]);

  constructor() {
    const sub = this.datos.especies().subscribe((lista) => this.especies.set(lista));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }
}
