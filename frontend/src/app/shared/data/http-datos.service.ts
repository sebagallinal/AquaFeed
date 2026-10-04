import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, map, Observable, of, switchMap, throwError, timer } from 'rxjs';

import type { Dispositivo } from '../models/dispositivo.model';
import type { Lectura } from '../models/lectura.model';
import type { PerfilEspecie } from '../models/perfil-especie.model';
import type { Usuario } from '../models/usuario.model';
import {
  DatosApi,
  PeceraNoDisponibleError,
  type AlertaVista,
  type ComandoAlimentacion,
  type DispositivoAdmin,
  type PeceraDetalle,
  type PeceraResumen,
  type ResumenAdmin,
} from './datos-api';
import { ESPECIES } from './especies.mock';

const API = '/api/v1';

/** El ESP32 publica cada 5 s: las pantallas con lecturas se refrescan al mismo ritmo. */
const INTERVALO_VIVO_MS = 5000;

interface PeceraBackend {
  dispositivo: Dispositivo;
  lectura: Lectura | null;
}

/**
 * Datos del backend Express (`/api/v1`). El usuario sale del token, así que los `usuarioId`
 * de `DatosApi` no viajan. Lo que el backend todavía no tiene queda vacío: horarios y alertas.
 * Las fichas de especies siguen siendo las que trae el frontend.
 */
@Injectable()
export class HttpDatosService implements DatosApi {
  private readonly http = inject(HttpClient);

  pecerasDe(): Observable<PeceraResumen[]> {
    return this.enVivo(() => this.http.get<PeceraBackend[]>(`${API}/peceras`)).pipe(
      map((lista) => lista.map(resumen)),
    );
  }

  pecera(id: string): Observable<PeceraDetalle | null> {
    return this.enVivo(() =>
      this.http.get<PeceraBackend>(`${API}/peceras/${encodeURIComponent(id)}`).pipe(
        map((pecera): PeceraDetalle => ({ ...resumen(pecera), horarios: [] })),
        catchError(nullSiNoExiste),
      ),
    );
  }

  alertasDe(): Observable<AlertaVista[]> {
    return of([]);
  }

  reconocerAlerta(): Observable<void> {
    return throwError(() => new PeceraNoDisponibleError('No encontramos esa alerta.'));
  }

  especies(): Observable<PerfilEspecie[]> {
    return of([...ESPECIES]);
  }

  especie(slug: string): Observable<PerfilEspecie | null> {
    return of(ESPECIES.find((item) => item.slug === slug) ?? null);
  }

  alimentar(
    deviceId: string,
    _usuarioId: string,
    portions: number,
  ): Observable<ComandoAlimentacion> {
    return this.http
      .post<ComandoAlimentacion>(`${API}/peceras/${encodeURIComponent(deviceId)}/alimentar`, {
        portions,
      })
      .pipe(
        catchError((error: unknown) =>
          throwError(() => new PeceraNoDisponibleError(mensajeDe(error))),
        ),
      );
  }

  resumenAdmin(): Observable<ResumenAdmin> {
    return this.enVivo(() => this.http.get<ResumenAdmin>(`${API}/admin/resumen`));
  }

  usuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API}/admin/usuarios`);
  }

  usuario(id: string): Observable<Usuario | null> {
    return this.http
      .get<Usuario>(`${API}/admin/usuarios/${encodeURIComponent(id)}`)
      .pipe(catchError(nullSiNoExiste));
  }

  dispositivosAdmin(): Observable<DispositivoAdmin[]> {
    return this.enVivo(() => this.http.get<DispositivoAdmin[]>(`${API}/admin/dispositivos`)).pipe(
      map((lista) => lista.map(conEspecie)),
    );
  }

  dispositivoAdmin(id: string): Observable<DispositivoAdmin | null> {
    return this.enVivo(() =>
      this.http
        .get<DispositivoAdmin>(`${API}/admin/dispositivos/${encodeURIComponent(id)}`)
        .pipe(map(conEspecie), catchError(nullSiNoExiste)),
    );
  }

  alertasAdmin(): Observable<AlertaVista[]> {
    return of([]);
  }

  /** Repite el pedido cada 5 s. Si uno falla, la pantalla se queda con el último valor. */
  private enVivo<T>(pedido: () => Observable<T>): Observable<T> {
    return timer(0, INTERVALO_VIVO_MS).pipe(
      switchMap(() => pedido().pipe(catchError(() => EMPTY))),
    );
  }
}

function resumen(pecera: PeceraBackend): PeceraResumen {
  return {
    ...pecera,
    proxima: null,
    especie: especieDe(pecera.dispositivo.speciesProfileId),
    alertasAbiertas: 0,
  };
}

function conEspecie(dispositivo: DispositivoAdmin): DispositivoAdmin {
  return {
    ...dispositivo,
    especieNombre: especieDe(dispositivo.speciesProfileId)?.nombre ?? null,
  };
}

function especieDe(id: string | null): PerfilEspecie | null {
  return ESPECIES.find((item) => item.id === id) ?? null;
}

function nullSiNoExiste(error: unknown): Observable<null> {
  return error instanceof HttpErrorResponse && error.status === 404
    ? of(null)
    : throwError(() => error);
}

function mensajeDe(error: unknown): string {
  const cuerpo: unknown = error instanceof HttpErrorResponse ? error.error : null;
  if (typeof cuerpo === 'object' && cuerpo !== null && 'message' in cuerpo) {
    return String(cuerpo.message);
  }
  return 'No se pudo enviar el comando.';
}
