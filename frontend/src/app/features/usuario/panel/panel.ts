import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { DATOS_API, type PeceraResumen } from '../../../shared/data/datos-api';
import { haceCuanto, textoPh, textoTds, textoTemp, textoPorciones } from '../../../shared/formato';
import {
  AlimentarDialog,
  type AlimentarDialogData,
} from '../../../shared/ui/alimentar-dialog/alimentar-dialog';

@Component({
  selector: 'app-panel',
  imports: [RouterLink, MatIconModule],
  templateUrl: './panel.html',
})
export class Panel {
  private readonly auth = inject(AUTH_API);
  private readonly datos = inject(DATOS_API);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly peceras = signal<PeceraResumen[]>([]);
  protected readonly nombre = computed(() => this.auth.usuario()?.nombre.split(' ')[0] ?? '');
  protected readonly textoPh = textoPh;
  protected readonly textoTemp = textoTemp;
  protected readonly textoTds = textoTds;
  protected readonly haceCuanto = haceCuanto;

  constructor() {
    const id = this.auth.usuario()?.id ?? '';
    const sub = this.datos.pecerasDe(id).subscribe((lista) => this.peceras.set(lista));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected pedir(pecera: PeceraResumen): void {
    const ref = this.dialog.open<AlimentarDialog, AlimentarDialogData, number>(AlimentarDialog, {
      data: { nombre: pecera.dispositivo.nombre, online: pecera.dispositivo.online },
      width: 'min(440px, calc(100vw - 32px))',
      autoFocus: 'dialog',
    });
    ref.afterClosed().subscribe((porciones) => {
      if (typeof porciones !== 'number') {
        return;
      }
      const usuarioId = this.auth.usuario()?.id ?? '';
      this.datos.alimentar(pecera.dispositivo.id, usuarioId, porciones).subscribe({
        next: (comando) => {
          this.snack.open(
            `Comando enviado: ${textoPorciones(comando.portions)} para ${pecera.dispositivo.nombre}.`,
            'Cerrar',
            { duration: 5000 },
          );
        },
        error: (error: unknown) => {
          const mensaje = error instanceof Error ? error.message : 'No se pudo enviar el comando.';
          this.snack.open(mensaje, 'Cerrar', { duration: 5000 });
        },
      });
    });
  }
}
