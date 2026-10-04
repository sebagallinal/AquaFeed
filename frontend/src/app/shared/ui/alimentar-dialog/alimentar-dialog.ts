import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

import { textoPorciones } from '../../formato';

export interface AlimentarDialogData {
  nombre: string;
  online: boolean;
}

@Component({
  selector: 'app-alimentar-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './alimentar-dialog.html',
})
export class AlimentarDialog {
  protected readonly data = inject<AlimentarDialogData>(MAT_DIALOG_DATA);
  protected readonly porciones = signal(1);
  protected readonly opciones = [1, 2, 3, 4, 5];
  protected readonly textoPorciones = textoPorciones;
}
