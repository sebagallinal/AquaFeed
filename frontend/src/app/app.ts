import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <a class="af-skip" href="#contenido">Saltar al contenido</a>
    <router-outlet />
  `,
})
export class App {}
