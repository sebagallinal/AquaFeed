import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ESPECIES } from '../../shared/data/especies.mock';

/**
 * Autor y licencia de cada foto de especie. Las licencias CC BY y CC BY-SA piden nombrar al
 * autor: en vez de repetirlo debajo de cada foto, se juntan todos en esta página.
 */
@Component({
  selector: 'app-creditos-fotos',
  imports: [RouterLink],
  templateUrl: './creditos-fotos.html',
})
export class CreditosFotos {
  protected readonly especies = [...ESPECIES].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es'),
  );
}
