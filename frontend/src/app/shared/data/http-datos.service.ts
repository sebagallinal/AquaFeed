import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, map, Observable, of, switchMap, throwError, timer } from 'rxjs';

import { proximaAlimentacion } from '../fecha';
import type { ConfigAlertas } from '../models/alerta.model';
import type { Dispositivo } from '../models/dispositivo.model';
import type { Horario, HorarioEditable } from '../models/horario.model';
import type { Lectura } from '../models/lectura.model';
import type { PerfilEspecie } from '../models/perfil-especie.model';
import type { AlimentacionReporte, PeriodoReporte, ReporteDatos } from '../models/reporte.model';
import type { CambiosUsuario, NuevoUsuario, Usuario } from '../models/usuario.model';
import {
  DatosApi,
  PeceraNoDisponibleError,
  type AlertaVista,
  type CambiosPecera,
  type ComandoAlimentacion,
  type DispositivoAdmin,
  type HorariosGuardados,
  type NuevoDispositivo,
  type PeceraDetalle,
  type PeceraResumen,
  type ResumenAdmin,
} from './datos-api';
import { ESPECIES } from './especies.mock';

const API = '/api/v1';

/** El ESP32 publica cada 5 s: las pantallas con lecturas se refrescan al mismo ritmo. */
const INTERVALO_VIVO_MS = 5000;

/** El backend manda las lecturas como [ts, temp, ph, tds] para achicar la respuesta. */
interface ReporteBackend {
  deviceId: string;
  dias: PeriodoReporte;
  desde: number;
  hasta: number;
  lecturas: [number, number | null, number | null, number | null][];
  alimentaciones: AlimentacionReporte[];
}

interface PeceraBackend {
  dispositivo: Dispositivo;
  lectura: Lectura | null;
  horarios: Horario[];
}

/**
 * Datos del backend Express (`/api/v1`). El usuario sale del token, así que los `usuarioId`
 * de `DatosApi` no viajan.
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
        map((pecera): PeceraDetalle => ({ ...resumen(pecera), horarios: pecera.horarios })),
        catchError(nullSiNoExiste),
      ),
    );
  }

  alertasDe(): Observable<AlertaVista[]> {
    return this.enVivo(() => this.http.get<AlertaVista[]>(`${API}/alertas`));
  }

  reconocerAlerta(alertaId: string): Observable<void> {
    return this.http
      .post<void>(`${API}/alertas/${encodeURIComponent(alertaId)}/reconocer`, {})
      .pipe(
        catchError((error: unknown) =>
          throwError(
            () => new PeceraNoDisponibleError(mensajeDe(error, 'No se pudo reconocer la alerta.')),
          ),
        ),
      );
  }

  editarPecera(
    deviceId: string,
    _usuarioId: string,
    cambios: CambiosPecera,
  ): Observable<PeceraResumen> {
    return this.http
      .patch<PeceraBackend>(`${API}/peceras/${encodeURIComponent(deviceId)}`, cambios)
      .pipe(
        map(resumen),
        catchError((error: unknown) =>
          throwError(
            () =>
              new PeceraNoDisponibleError(mensajeDe(error, 'No se pudieron guardar los cambios.')),
          ),
        ),
      );
  }

  configAlertas(deviceId: string): Observable<ConfigAlertas> {
    return this.http.get<ConfigAlertas>(`${API}/peceras/${encodeURIComponent(deviceId)}/alertas`);
  }

  guardarConfigAlertas(
    deviceId: string,
    _usuarioId: string,
    config: ConfigAlertas,
  ): Observable<ConfigAlertas> {
    return this.http
      .put<ConfigAlertas>(`${API}/peceras/${encodeURIComponent(deviceId)}/alertas`, config)
      .pipe(
        catchError((error: unknown) =>
          throwError(
            () =>
              new PeceraNoDisponibleError(mensajeDe(error, 'No se pudieron guardar las alertas.')),
          ),
        ),
      );
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

  reporte(
    deviceId: string,
    _usuarioId: string,
    dias: PeriodoReporte,
  ): Observable<ReporteDatos | null> {
    return this.http
      .get<ReporteBackend>(`${API}/peceras/${encodeURIComponent(deviceId)}/reportes`, {
        params: { dias },
      })
      .pipe(
        map((r): ReporteDatos => ({
          ...r,
          lecturas: r.lecturas.map(([ts, temp, ph, tds]) => ({ ts, temp, ph, tds })),
        })),
        catchError(nullSiNoExiste),
      );
  }

  guardarHorarios(
    deviceId: string,
    _usuarioId: string,
    horarios: HorarioEditable[],
  ): Observable<HorariosGuardados> {
    return this.http
      .put<HorariosGuardados>(`${API}/peceras/${encodeURIComponent(deviceId)}/horarios`, {
        horarios,
      })
      .pipe(
        catchError((error: unknown) =>
          throwError(
            () =>
              new PeceraNoDisponibleError(mensajeDe(error, 'No se pudieron guardar los horarios.')),
          ),
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

  crearUsuario(datos: NuevoUsuario): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${API}/admin/usuarios`, datos)
      .pipe(catchError(conMensaje('No se pudo crear el usuario.')));
  }

  editarUsuario(id: string, cambios: CambiosUsuario): Observable<Usuario> {
    return this.http
      .patch<Usuario>(`${API}/admin/usuarios/${encodeURIComponent(id)}`, cambios)
      .pipe(catchError(conMensaje('No se pudieron guardar los cambios.')));
  }

  registrarDispositivo(datos: NuevoDispositivo): Observable<DispositivoAdmin> {
    return this.http
      .post<DispositivoAdmin>(`${API}/admin/dispositivos`, datos)
      .pipe(map(conEspecie), catchError(conMensaje('No se pudo registrar el dispositivo.')));
  }

  asignarDispositivo(id: string, usuarioId: string | null): Observable<DispositivoAdmin> {
    return this.http
      .patch<DispositivoAdmin>(`${API}/admin/dispositivos/${encodeURIComponent(id)}`, {
        usuarioId,
      })
      .pipe(map(conEspecie), catchError(conMensaje('No se pudo asignar el dispositivo.')));
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
    return this.enVivo(() => this.http.get<AlertaVista[]>(`${API}/admin/alertas`));
  }

  /** Repite el pedido cada 5 s. Si uno falla, la pantalla se queda con el último valor. */
  private enVivo<T>(pedido: () => Observable<T>): Observable<T> {
    return timer(0, INTERVALO_VIVO_MS).pipe(
      switchMap(() => pedido().pipe(catchError(() => EMPTY))),
    );
  }
}

function resumen({ dispositivo, lectura, horarios }: PeceraBackend): PeceraResumen {
  return {
    dispositivo,
    lectura,
    proxima: proximaAlimentacion(horarios ?? []),
    especie: especieDe(dispositivo.speciesProfileId),
    alertasAbiertas: 0, // ninguna pantalla lo muestra por pecera; la lista sale de /alertas
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

/** Convierte el error HTTP en un error con el mensaje del backend, para mostrarlo tal cual. */
function conMensaje(porDefecto: string) {
  return (error: unknown): Observable<never> =>
    throwError(() => new PeceraNoDisponibleError(mensajeDe(error, porDefecto)));
}

function mensajeDe(error: unknown, porDefecto = 'No se pudo enviar el comando.'): string {
  const cuerpo: unknown = error instanceof HttpErrorResponse ? error.error : null;
  if (typeof cuerpo === 'object' && cuerpo !== null && 'message' in cuerpo) {
    return String(cuerpo.message);
  }
  return porDefecto;
}
