import { Component, inject, signal } from '@angular/core';

import { AUTH_API, ClaveInvalidaError } from '../../../core/auth/auth-api';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.html',
})
export class Cuenta {
  private readonly auth = inject(AUTH_API);

  protected readonly usuario = this.auth.usuario;
  protected readonly actual = signal('');
  protected readonly nueva = signal('');
  protected readonly repetir = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly lista = signal(false);
  protected readonly guardando = signal(false);

  protected guardar(): void {
    this.lista.set(false);
    const actual = this.actual();
    const nueva = this.nueva();
    if (!actual || !nueva) {
      this.error.set('Completá la contraseña actual y la nueva.');
      return;
    }
    if (nueva.length < 8 || nueva.length > 72) {
      this.error.set('La contraseña tiene que tener entre 8 y 72 caracteres.');
      return;
    }
    if (nueva !== this.repetir()) {
      this.error.set('La repetición no coincide con la contraseña nueva.');
      return;
    }
    if (nueva === actual) {
      this.error.set('La nueva contraseña tiene que ser distinta de la actual.');
      return;
    }
    this.guardando.set(true);
    this.error.set(null);
    this.auth.cambiarClave(actual, nueva).subscribe({
      next: () => {
        this.guardando.set(false);
        this.lista.set(true);
        this.actual.set('');
        this.nueva.set('');
        this.repetir.set('');
      },
      error: (error: unknown) => {
        this.guardando.set(false);
        this.error.set(
          error instanceof ClaveInvalidaError || error instanceof Error
            ? error.message
            : 'No pudimos cambiar la contraseña.',
        );
      },
    });
  }
}
