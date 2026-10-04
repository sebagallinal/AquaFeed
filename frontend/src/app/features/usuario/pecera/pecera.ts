import { Component, effect, inject, input, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API, type PeceraDetalle } from '../../../shared/data/datos-api';
import { haceCuanto, textoPh, textoPorciones, textoTds, textoTemp } from '../../../shared/formato';
import {
  AlimentarDialog,
  type AlimentarDialogData,
} from '../../../shared/ui/alimentar-dialog/alimentar-dialog';

@Component({
  selector: 'app-pecera',
  imports: [RouterLink, MatIconModule],
  templateUrl: './pecera.html',
})
export class Pecera {
  readonly id = input.required<string>();

  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);

  protected readonly detalle = signal<PeceraDetalle | null | undefined>(undefined);
  protected readonly textoPh = textoPh;
  protected readonly textoTemp = textoTemp;
  protected readonly textoTds = textoTds;
  protected readonly haceCuanto = haceCuanto;

  constructor() {
    effect((onCleanup) => {
      const id = this.id();
      const usuarioId = this.auth.usuario()?.id ?? '';
      const sub = this.datos.pecera(id, usuarioId).subscribe((valor) => this.detalle.set(valor));
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected pedir(pecera: PeceraDetalle): void {
    const ref = this.dialog.open<AlimentarDialog, AlimentarDialogData, number>(AlimentarDialog, {
      data: { nombre: pecera.dispositivo.nombre, online: pecera.dispositivo.online },
      width: 'min(440px, calc(100vw - 32px))',
      autoFocus: 'dialog',
    });
    ref.afterClosed().subscribe((porciones) => {
      if (typeof porciones !== 'number') {
        return;
      }
      this.datos
        .alimentar(pecera.dispositivo.id, this.auth.usuario()?.id ?? '', porciones)
        .subscribe({
          next: (comando) => {
            this.snack.open(
              `Comando enviado: ${textoPorciones(comando.portions)} para ${pecera.dispositivo.nombre}.`,
              'Cerrar',
              { duration: 5000 },
            );
          },
          error: (error: unknown) => {
            const mensaje =
              error instanceof Error ? error.message : 'No se pudo enviar el comando.';
            this.snack.open(mensaje, 'Cerrar', { duration: 5000 });
          },
        });
    });
  }
}
