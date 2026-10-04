import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { filter, map } from 'rxjs';

import type { Usuario } from '../../models/usuario.model';

export interface ItemNav {
  etiqueta: string;
  ruta: string;
  icono: string;
  exacta?: boolean;
  badge?: number;
}

@Component({
  selector: 'app-marco',
  imports: [MatSidenavModule, MatIconModule, RouterLink, RouterLinkActive],
  templateUrl: './marco.html',
})
export class Marco {
  readonly area = input<'usuario' | 'admin'>('usuario');
  readonly items = input.required<readonly ItemNav[]>();
  readonly usuario = input<Usuario | null>(null);
  readonly salir = output<void>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tituloDocumento = inject(Title);
  private readonly breakpoints = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly menuAbierto = signal(false);
  protected readonly titulo = signal('AquaFeed');
  protected readonly esMovil = toSignal(
    this.breakpoints.observe('(max-width: 880px)').pipe(map((estado) => estado.matches)),
    { initialValue: pantallaChica() },
  );

  constructor() {
    const url = toSignal(
      this.router.events.pipe(
        filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
        map((evento) => evento.urlAfterRedirects),
      ),
      { initialValue: this.router.url },
    );

    effect(() => {
      url();
      const titulo = tituloActivo(this.route);
      this.titulo.set(titulo);
      this.tituloDocumento.setTitle(`${titulo} · AquaFeed`);
    });

    const sub = this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd))
      .subscribe(() => this.menuAbierto.set(false));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected inicio(): string {
    return this.area() === 'admin' ? '/admin' : '/app';
  }

  protected abrirMenu(): void {
    this.menuAbierto.set(true);
  }

  protected cerrarMenu(): void {
    if (this.esMovil()) {
      this.menuAbierto.set(false);
    }
  }
}

function pantallaChica(): boolean {
  return (
    typeof globalThis.matchMedia === 'function' &&
    globalThis.matchMedia('(max-width: 880px)').matches
  );
}

function tituloActivo(route: ActivatedRoute): string {
  let actual: ActivatedRoute | null = route;
  let titulo = 'AquaFeed';
  while (actual) {
    const dato = actual.snapshot.data['titulo'];
    if (typeof dato === 'string' && dato.length > 0) {
      titulo = dato;
    }
    actual = actual.firstChild;
  }
  return titulo;
}
