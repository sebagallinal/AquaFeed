import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import type { CambiosPecera } from '../../data/datos-api';
import type { PerfilEspecie } from '../../models/perfil-especie.model';

export interface EditarPeceraData {
  nombre: string;
  especieId: string | null;
  especies: readonly PerfilEspecie[];
}

@Component({
  selector: 'app-editar-pecera-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './editar-pecera-dialog.html',
})
export class EditarPeceraDialog {
  protected readonly data = inject<EditarPeceraData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<EditarPeceraDialog, CambiosPecera>>(MatDialogRef);

  protected readonly nombre = signal(this.data.nombre);
  protected readonly especieId = signal(this.data.especieId ?? '');
  protected readonly especies = [...this.data.especies].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es'),
  );

  protected readonly error = computed(() => {
    const nombre = this.nombre().trim();
    if (!nombre) {
      return 'Poné un nombre para la pecera.';
    }
    return nombre.length > 60 ? 'El nombre puede tener hasta 60 caracteres.' : null;
  });

  protected readonly elegida = computed(
    () => this.especies.find((e) => e.id === this.especieId()) ?? null,
  );

  protected guardar(): void {
    if (this.error()) {
      return;
    }
    this.ref.close({ nombre: this.nombre().trim(), especieId: this.especieId() || null });
  }
}
