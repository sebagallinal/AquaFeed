import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ProximaAlimentacion } from '../fecha';
import type { Alerta, ConfigAlertas } from '../models/alerta.model';
import type { Dispositivo } from '../models/dispositivo.model';
import type { Horario, HorarioEditable } from '../models/horario.model';
import type { Lectura } from '../models/lectura.model';
import type { PerfilEspecie } from '../models/perfil-especie.model';
import type { NuevaPlantilla } from '../especies/plantillas';
import type { PeriodoReporte, ReporteDatos } from '../models/reporte.model';
import type { CambiosUsuario, NuevoUsuario, Usuario } from '../models/usuario.model';

export interface PeceraResumen {
  dispositivo: Dispositivo;
  lectura: Lectura | null;
  proxima: ProximaAlimentacion | null;
  especie: PerfilEspecie | null;
  alertasAbiertas: number;
}

export interface PeceraDetalle extends PeceraResumen {
  horarios: Horario[];
}

export interface NuevoDispositivo {
  id: string;
  nombre?: string;
  usuarioId: string | null;
}

export interface CambiosPecera {
  nombre?: string;
  especieId?: string | null;
}

export interface AlertaVista extends Alerta {
  nombrePecera: string;
}

export interface DispositivoAdmin extends Dispositivo {
  duenoNombre: string | null;
  duenoEmail: string | null;
  especieNombre: string | null;
}

export interface ServicioSalud {
  nombre: string;
  estado: 'ok' | 'sin-conectar';
  detalle: string;
}

export interface ResumenAdmin {
  usuarios: number;
  dispositivos: number;
  enLinea: number;
  sinVincular: number;
  alertasAbiertas: number;
  servicios: ServicioSalud[];
}

/** Respuesta al guardar el calendario. `enviado`: el broker ya se lo pasó al dispositivo. */
export interface HorariosGuardados {
  horarios: Horario[];
  configVersion: number;
  enviado: boolean;
}

export interface ComandoAlimentacion {
  cmdId: string;
  status: 'sent';
  portions: number;
  deviceId: string;
}

/**
 * Datos que hoy salen de memoria y mañana van a salir de `/api/v1`.
 * Reemplazar `DATOS_API` alcanza para conectar el backend sin tocar las pantallas.
 */
export interface DatosApi {
  pecerasDe(usuarioId: string): Observable<PeceraResumen[]>;
  pecera(id: string, usuarioId: string): Observable<PeceraDetalle | null>;
  alertasDe(usuarioId: string): Observable<AlertaVista[]>;
  reconocerAlerta(alertaId: string, usuarioId: string): Observable<void>;
  especies(): Observable<PerfilEspecie[]>;
  especie(slug: string): Observable<PerfilEspecie | null>;
  /** Especies propias de este usuario. Son privadas: solo las ve quien las creó. */
  plantillasDe(usuarioId: string): Observable<PerfilEspecie[]>;
  crearPlantilla(usuarioId: string, datos: NuevaPlantilla): Observable<PerfilEspecie>;
  alimentar(deviceId: string, usuarioId: string, portions: number): Observable<ComandoAlimentacion>;
  /** Cambia el nombre o la especie (null = sin especie). Devuelve la pecera actualizada. */
  editarPecera(
    deviceId: string,
    usuarioId: string,
    cambios: CambiosPecera,
  ): Observable<PeceraResumen>;
  configAlertas(deviceId: string, usuarioId: string): Observable<ConfigAlertas>;
  guardarConfigAlertas(
    deviceId: string,
    usuarioId: string,
    config: ConfigAlertas,
  ): Observable<ConfigAlertas>;
  /** Lecturas y alimentaciones del período. null si la pecera no existe o no es del usuario. */
  reporte(
    deviceId: string,
    usuarioId: string,
    dias: PeriodoReporte,
  ): Observable<ReporteDatos | null>;
  /** Reemplaza el calendario completo de la pecera. */
  guardarHorarios(
    deviceId: string,
    usuarioId: string,
    horarios: HorarioEditable[],
  ): Observable<HorariosGuardados>;
  resumenAdmin(): Observable<ResumenAdmin>;
  usuarios(): Observable<Usuario[]>;
  usuario(id: string): Observable<Usuario | null>;
  crearUsuario(datos: NuevoUsuario): Observable<Usuario>;
  editarUsuario(id: string, cambios: CambiosUsuario): Observable<Usuario>;
  dispositivosAdmin(): Observable<DispositivoAdmin[]>;
  /** Alta de una placa por su ID (af- + MAC) antes de que se conecte. */
  registrarDispositivo(datos: NuevoDispositivo): Observable<DispositivoAdmin>;
  /** Cambia el dueño de una placa; null la deja sin dueño. */
  asignarDispositivo(id: string, usuarioId: string | null): Observable<DispositivoAdmin>;
  dispositivoAdmin(id: string): Observable<DispositivoAdmin | null>;
  alertasAdmin(): Observable<AlertaVista[]>;
}

export const DATOS_API = new InjectionToken<DatosApi>('DATOS_API');

export class PeceraNoDisponibleError extends Error {
  constructor(mensaje = 'No encontramos esa pecera.') {
    super(mensaje);
    this.name = 'PeceraNoDisponibleError';
  }
}
