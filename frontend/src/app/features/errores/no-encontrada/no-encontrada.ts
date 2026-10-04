import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { rutaPorRol } from '../../../core/auth/destino';

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink],
  templateUrl: './no-encontrada.html',
})
export class NoEncontrada {
  private readonly auth = inject(AUTH_API);

  protected inicio(): string {
    const usuario = this.auth.usuario();
    return usuario ? rutaPorRol(usuario.rol) : '/login';
  }
}
