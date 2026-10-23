import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { generarClave } from '../../../shared/clave';
import { DATOS_API, type DispositivoAdmin } from '../../../shared/data/datos-api';
import type { Rol, Usuario } from '../../../shared/models/usuario.model';
import {
  aplicarEleccion,
  ElegirDispositivo,
  errorEleccion,
} from '../../../shared/ui/elegir-dispositivo/elegir-dispositivo';

/** Lo que se le pasa a la persona después de crear la cuenta. Se muestra una sola vez. */
interface CuentaCreada {
  usuario: Usuario;
  password: string;
  dispositivo: DispositivoAdmin | null;
  errorDispositivo: string | null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-usuarios-admin',
  imports: [RouterLink, ElegirDispositivo],
  templateUrl: './usuarios.html',
})
export class UsuariosAdmin {
  private readonly datos = inject(DATOS_API);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly dispositivos = signal<DispositivoAdmin[]>([]);

  // Formulario de alta
  protected readonly abierto = signal(false);
  protected readonly nombre = signal('');
  protected readonly email = signal('');
  protected readonly password = signal(generarClave());
  protected readonly rol = signal<Rol>('user');
  protected readonly seleccion = signal('');
  protected readonly idNuevo = signal('');
  protected readonly intentado = signal(false);
  protected readonly guardando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);
  protected readonly creada = signal<CuentaCreada | null>(null);

  protected readonly pecerasPor = computed(() => {
    const cuenta = new Map<string, number>();
    for (const d of this.dispositivos()) {
      if (d.ownerId) {
        cuenta.set(d.ownerId, (cuenta.get(d.ownerId) ?? 0) + 1);
      }
    }
    return cuenta;
  });

  protected readonly error = computed(() => {
    if (this.nombre().trim().length < 2) {
      return 'Escribí el nombre (al menos 2 letras).';
    }
    if (!EMAIL.test(this.email().trim())) {
      return 'Escribí un correo válido.';
    }
    if (this.password().length < 8) {
      return 'La contraseña tiene que tener al menos 8 caracteres.';
    }
    return errorEleccion(this.seleccion(), this.idNuevo(), this.dispositivos());
  });

  constructor() {
    const subUsuarios = this.datos.usuarios().subscribe((lista) => this.usuarios.set(lista));
    const subDispositivos = this.datos
      .dispositivosAdmin()
      .subscribe((lista) => this.dispositivos.set(lista));
    this.destroyRef.onDestroy(() => {
      subUsuarios.unsubscribe();
      subDispositivos.unsubscribe();
    });
  }

  protected etiquetaRol(rol: Usuario['rol']): string {
    return rol === 'admin' ? 'Admin' : 'Usuario';
  }

  protected abrir(): void {
    this.creada.set(null);
    this.abierto.set(true);
  }

  protected cancelar(): void {
    this.abierto.set(false);
    this.limpiar();
  }

  protected nuevaClave(): void {
    this.password.set(generarClave());
  }

  protected crear(): void {
    this.intentado.set(true);
    if (this.error() || this.guardando()) {
      return;
    }
    const password = this.password();
    const seleccion = this.seleccion();
    const idNuevo = this.idNuevo();
    const dispositivos = this.dispositivos();
    this.guardando.set(true);
    this.errorServidor.set(null);

    this.datos
      .crearUsuario({
        nombre: this.nombre().trim(),
        email: this.email().trim().toLowerCase(),
        password,
        rol: this.rol(),
      })
      .pipe(
        switchMap((usuario) =>
          aplicarEleccion(this.datos, usuario.id, seleccion, idNuevo, dispositivos).pipe(
            map((dispositivo) => ({ usuario, dispositivo, errorDispositivo: null })),
            // La cuenta ya se creó: si falla la placa se avisa, pero no se pierde la cuenta
            catchError((e: unknown) =>
              of({
                usuario,
                dispositivo: null,
                errorDispositivo: e instanceof Error ? e.message : 'No se pudo asignar la placa.',
              }),
            ),
          ),
        ),
      )
      .subscribe({
        next: (resultado) => {
          this.guardando.set(false);
          this.creada.set({ ...resultado, password });
          this.usuarios.update((lista) =>
            lista.some((u) => u.id === resultado.usuario.id)
              ? lista
              : [...lista, resultado.usuario],
          );
          this.abierto.set(false);
          this.limpiar();
        },
        error: (e: unknown) => {
          this.guardando.set(false);
          this.errorServidor.set(e instanceof Error ? e.message : 'No se pudo crear el usuario.');
        },
      });
  }

  protected copiar(cuenta: CuentaCreada): void {
    const texto =
      `AquaFeed — ${location.origin}\n` +
      `Usuario: ${cuenta.usuario.username ?? cuenta.usuario.email}\n` +
      `Correo: ${cuenta.usuario.email}\n` +
      `Contraseña: ${cuenta.password}`;
    void navigator.clipboard?.writeText(texto);
  }

  private limpiar(): void {
    this.nombre.set('');
    this.email.set('');
    this.password.set(generarClave());
    this.rol.set('user');
    this.seleccion.set('');
    this.idNuevo.set('');
    this.intentado.set(false);
    this.errorServidor.set(null);
  }
}
