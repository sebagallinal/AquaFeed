import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  avisoDeEspecie,
  filtrarEspecies,
  type FiltroAgua,
  type FiltroAmbiente,
} from '../../especies/buscar-especie';
import { etiquetaTipoAgua, type PerfilEspecie } from '../../models/perfil-especie.model';

@Component({
  selector: 'app-lista-especies',
  imports: [RouterLink],
  templateUrl: './lista-especies.html',
})
export class ListaEspecies {
  readonly especies = input.required<readonly PerfilEspecie[]>();
  /** Prefijo de la ruta de detalle, por ejemplo `/app/especies`. */
  readonly rutaDe = input.required<string>();
  readonly clave = input<'slug' | 'id'>('slug');
  readonly cta = input('Ver la ficha');

  protected readonly consulta = signal('');
  protected readonly filtro = signal<FiltroAgua>('todas');
  protected readonly filtroAmbiente = signal<FiltroAmbiente>('todos');
  protected readonly etiquetaTipoAgua = etiquetaTipoAgua;
  protected readonly avisoDeEspecie = avisoDeEspecie;
  protected readonly visibles = computed(() =>
    filtrarEspecies(this.especies(), this.consulta(), this.filtro(), this.filtroAmbiente()),
  );
  protected readonly hayFiltro = computed(
    () =>
      this.consulta().trim() !== '' ||
      this.filtro() !== 'todas' ||
      this.filtroAmbiente() !== 'todos',
  );
  protected readonly textoResultados = computed(() => {
    const total = this.especies().length;
    const n = this.visibles().length;
    if (n === total) {
      return `${total} especies`;
    }
    return `${n} de ${total} especies`;
  });

  protected alBuscar(evento: Event): void {
    const campo = evento.target;
    if (!(campo instanceof HTMLInputElement)) {
      return;
    }
    this.consulta.set(campo.value);
  }

  protected alFiltrar(evento: Event): void {
    const campo = evento.target;
    if (!(campo instanceof HTMLInputElement)) {
      return;
    }
    if (campo.name === 'tipo-agua') {
      if (campo.value === 'fria' || campo.value === 'tropical' || campo.value === 'todas') {
        this.filtro.set(campo.value);
      }
      return;
    }
    if (
      campo.value === 'todos' ||
      campo.value === 'acuario' ||
      campo.value === 'estanque' ||
      campo.value === 'no-apto'
    ) {
      this.filtroAmbiente.set(campo.value);
    }
  }

  protected limpiar(): void {
    this.consulta.set('');
    this.filtro.set('todas');
    this.filtroAmbiente.set('todos');
  }

  protected enlace(especie: PerfilEspecie): string[] {
    const id = this.clave() === 'id' ? especie.id : especie.slug;
    return [this.rutaDe(), id];
  }
}
