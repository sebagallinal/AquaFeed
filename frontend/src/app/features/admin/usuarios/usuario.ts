import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AUTH_API } from '../../../core/auth/auth-api';
import { generarClave } from '../../../shared/clave';
import { DATOS_API, type DispositivoAdmin } from '../../../shared/data/datos-api';
import type { CambiosUsuario, Rol, Usuario } from '../../../shared/models/usuario.model';
import {
  aplicarEleccion,
  ElegirDispositivo,
  errorEleccion,
} from '../../../shared/ui/elegir-dispositivo/elegir-dispositivo';

type Aviso = { tipo: 'ok' | 'error'; texto: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-usuario-admin',
  imports: [RouterLink, ElegirDispositivo],
  templateUrl: './usuario.html',
})
export class UsuarioAdmin {
  readonly id = input.required<string>();

  private readonly datos = inject(DATOS_API);
  private readonly auth = inject(AUTH_API);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly usuario = signal<Usuario | null | undefined>(undefined);
  protected readonly dispositivos = signal<DispositivoAdmin[]>([]);
  protected readonly peceras = computed(() =>
    this.dispositivos().filter((d) => d.ownerId === this.id()),
  );
  protected readonly esUnoMismo = computed(() => this.auth.usuario()?.id === this.id());

  // Datos de la cuenta
  protected readonly nombre = signal('');
  protected readonly email = signal('');
  protected readonly rol = signal<Rol>('user');
  protected readonly activo = signal(true);
  protected readonly guardandoDatos = signal(false);
  protected readonly avisoDatos = signal<Aviso>(null);

  // Contraseña
  protected readonly clave = signal('');
  protected readonly claveGuardada = signal<string | null>(null);
  protected readonly avisoClave = signal<Aviso>(null);

  // Alimentadores
  protected readonly seleccion = signal('');
  protected readonly idNuevo = signal('');
  protected readonly avisoPeceras = signal<Aviso>(null);
  protected readonly asignando = signal(false);

  protected readonly cambiosDatos = computed<CambiosUsuario>(() => {
    const u = this.usuario();
    if (!u) {
      return {};
    }
    const cambios: CambiosUsuario = {};
    if (this.nombre().trim() !== u.nombre) cambios.nombre = this.nombre().trim();
    if (this.email().trim().toLowerCase() !== u.email)
      cambios.email = this.email().trim().toLowerCase();
    if (this.rol() !== u.rol) cambios.rol = this.rol();
    if (this.activo() !== u.activo) cambios.activo = this.activo();
    return cambios;
  });
  protected readonly hayCambios = computed(() => Object.keys(this.cambiosDatos()).length > 0);

  protected readonly errorDatos = computed(() => {
    if (this.nombre().trim().length < 2) return 'El nombre tiene que tener al menos 2 letras.';
    if (!EMAIL.test(this.email().trim())) return 'El correo no es válido.';
    return null;
  });

  constructor() {
    effect((onCleanup) => {
      const sub = this.datos.usuario(this.id()).subscribe((u) => {
        this.usuario.set(u);
        if (u) this.cargar(u);
      });
      onCleanup(() => sub.unsubscribe());
    });
    const sub = this.datos.dispositivosAdmin().subscribe((lista) => this.dispositivos.set(lista));
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  protected guardarDatos(): void {
    if (this.errorDatos() || !this.hayCambios() || this.guardandoDatos()) {
      return;
    }
    this.guardandoDatos.set(true);
    this.avisoDatos.set(null);
    this.datos.editarUsuario(this.id(), this.cambiosDatos()).subscribe({
      next: (u) => {
        this.guardandoDatos.set(false);
        this.usuario.set(u);
        this.cargar(u);
        this.avisoDatos.set({ tipo: 'ok', texto: 'Cambios guardados.' });
      },
      error: (e: unknown) => {
        this.guardandoDatos.set(false);
        this.avisoDatos.set({
          tipo: 'error',
          texto: mensaje(e, 'No se pudieron guardar los cambios.'),
        });
      },
    });
  }

  protected generar(): void {
    this.clave.set(generarClave());
  }

  protected guardarClave(): void {
    const clave = this.clave();
    if (clave.length < 8) {
      this.avisoClave.set({
        tipo: 'error',
        texto: 'La contraseña tiene que tener al menos 8 caracteres.',
      });
      return;
    }
    this.datos.editarUsuario(this.id(), { password: clave }).subscribe({
      next: () => {
        this.claveGuardada.set(clave);
        this.clave.set('');
        this.avisoClave.set(null);
      },
      error: (e: unknown) =>
        this.avisoClave.set({
          tipo: 'error',
          texto: mensaje(e, 'No se pudo cambiar la contraseña.'),
        }),
    });
  }

  protected asignar(): void {
    const error =
      this.seleccion() === ''
        ? 'Elegí una placa.'
        : errorEleccion(this.seleccion(), this.idNuevo(), this.dispositivos());
    if (error) {
      this.avisoPeceras.set({ tipo: 'error', texto: error });
      return;
    }
    this.asignando.set(true);
    aplicarEleccion(
      this.datos,
      this.id(),
      this.seleccion(),
      this.idNuevo(),
      this.dispositivos(),
    ).subscribe({
      next: (d) => {
        this.asignando.set(false);
        if (d) this.reemplazar(d);
        this.seleccion.set('');
        this.idNuevo.set('');
        this.avisoPeceras.set({ tipo: 'ok', texto: d ? `${d.nombre} quedó asignada.` : 'Listo.' });
      },
      error: (e: unknown) => {
        this.asignando.set(false);
        this.avisoPeceras.set({ tipo: 'error', texto: mensaje(e, 'No se pudo asignar la placa.') });
      },
    });
  }

  protected quitar(d: DispositivoAdmin): void {
    this.datos.asignarDispositivo(d.id, null).subscribe({
      next: (actualizado) => {
        this.reemplazar(actualizado);
        this.avisoPeceras.set({ tipo: 'ok', texto: `${d.nombre} quedó sin dueño.` });
      },
      error: (e: unknown) =>
        this.avisoPeceras.set({ tipo: 'error', texto: mensaje(e, 'No se pudo quitar la placa.') }),
    });
  }

  private reemplazar(d: DispositivoAdmin): void {
    this.dispositivos.update((lista) =>
      lista.some((x) => x.id === d.id) ? lista.map((x) => (x.id === d.id ? d : x)) : [...lista, d],
    );
  }

  private cargar(u: Usuario): void {
    this.nombre.set(u.nombre);
    this.email.set(u.email);
    this.rol.set(u.rol);
    this.activo.set(u.activo);
  }
}

function mensaje(e: unknown, porDefecto: string): string {
  return e instanceof Error ? e.message : porDefecto;
}
