import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';

import type { ProximaAlimentacion } from '../fecha';
import type { Alerta } from '../models/alerta.model';
import type { Dispositivo } from '../models/dispositivo.model';
import type { Horario } from '../models/horario.model';
import type { Lectura } from '../models/lectura.model';
import type { PerfilEspecie } from '../models/perfil-especie.model';
import type { Usuario } from '../models/usuario.model';

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
  alimentar(deviceId: string, usuarioId: string, portions: number): Observable<ComandoAlimentacion>;
  resumenAdmin(): Observable<ResumenAdmin>;
  usuarios(): Observable<Usuario[]>;
  usuario(id: string): Observable<Usuario | null>;
  dispositivosAdmin(): Observable<DispositivoAdmin[]>;
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
