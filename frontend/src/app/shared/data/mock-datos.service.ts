import { Injectable, Injector, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, map, of, startWith, throwError } from 'rxjs';

import { proximaAlimentacion } from '../fecha';
import type { Alerta } from '../models/alerta.model';
import type { Dispositivo } from '../models/dispositivo.model';
import type { Horario } from '../models/horario.model';
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

const MAX_PORCIONES = 5;
const ZONA = 'America/Argentina/Buenos_Aires';

const USUARIOS: readonly Usuario[] = [
  {
    id: 'usr-admin',
    nombre: 'Equipo AquaFeed',
    email: 'equipo@correo.com',
    rol: 'admin',
    activo: true,
  },
  {
    id: 'usr-horacio',
    nombre: 'Horacio Vespoli',
    email: 'horacio.vespoli@correo.com',
    rol: 'user',
    activo: true,
  },
  {
    id: 'usr-nahuel',
    nombre: 'Nahuel Mota',
    email: 'nahuel.mota@correo.com',
    rol: 'user',
    activo: true,
  },
  {
    id: 'usr-sebastian',
    nombre: 'Sebastian Gallinal',
    email: 'sebastian.gallinal@correo.com',
    rol: 'user',
    activo: true,
  },
];

const DISPOSITIVOS: readonly Dispositivo[] = [
  {
    id: 'af-a1b2c3d4e5f6',
    nombre: 'Living',
    ownerId: 'usr-nahuel',
    speciesProfileId: 'sp-guppy',
    tz: ZONA,
    configVersion: 7,
    lastSeen: null,
    online: true,
    estado: 'claimed',
    fw: '2.0.0',
    rssi: -61,
  },
  {
    id: 'af-b2c3d4e5f607',
    nombre: 'Estudio',
    ownerId: 'usr-nahuel',
    speciesProfileId: 'sp-neon',
    tz: ZONA,
    configVersion: 4,
    lastSeen: null,
    online: true,
    estado: 'claimed',
    fw: '2.0.0',
    rssi: -72,
  },
  {
    id: 'af-c3d4e5f60718',
    nombre: 'Pieza',
    ownerId: 'usr-nahuel',
    speciesProfileId: 'sp-molly',
    tz: ZONA,
    configVersion: 2,
    lastSeen: null,
    online: false,
    estado: 'claimed',
    fw: '1.9.0',
    rssi: null,
  },
  {
    id: 'af-d4e5f6071829',
    nombre: 'Placa de fábrica',
    ownerId: null,
    speciesProfileId: null,
    tz: ZONA,
    configVersion: 0,
    lastSeen: null,
    online: false,
    estado: 'unclaimed',
    fw: null,
    rssi: null,
  },
];

const HORARIOS: readonly Horario[] = [
  {
    id: 's1',
    deviceId: 'af-a1b2c3d4e5f6',
    days: [1, 2, 3, 4, 5, 6, 7],
    time: '09:00',
    portions: 2,
    enabled: true,
  },
  {
    id: 's2',
    deviceId: 'af-a1b2c3d4e5f6',
    days: [1, 2, 3, 4, 5, 6, 7],
    time: '19:30',
    portions: 1,
    enabled: true,
  },
  {
    id: 's3',
    deviceId: 'af-b2c3d4e5f607',
    days: [1, 3, 5],
    time: '08:30',
    portions: 1,
    enabled: true,
  },
  {
    id: 's4',
    deviceId: 'af-b2c3d4e5f607',
    days: [2, 4, 6],
    time: '20:00',
    portions: 1,
    enabled: true,
  },
  {
    id: 's5',
    deviceId: 'af-c3d4e5f60718',
    days: [1, 2, 3, 4, 5, 6, 7],
    time: '10:00',
    portions: 2,
    enabled: true,
  },
];

function haceIso(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

function lectura(
  deviceId: string,
  segundosAtras: number,
  valores: Pick<Lectura, 'waterTempC' | 'ph' | 'tdsPpm'>,
): Lectura {
  return {
    deviceId,
    ts: Math.floor(Date.now() / 1000) - segundosAtras,
    waterTempC: valores.waterTempC,
    ph: valores.ph,
    tdsPpm: valores.tdsPpm,
    sensorErrors: [],
  };
}

@Injectable()
export class MockDatosService implements DatosApi {
  private readonly injector = inject(Injector);
  private readonly alertas = signal<Alerta[]>([
    {
      id: 'al-pieza-offline',
      deviceId: 'af-c3d4e5f60718',
      tipo: 'offline',
      estado: 'abierta',
      mensaje: 'Pieza está sin conexión hace más de 10 minutos.',
      abiertaEn: haceIso(3 * 60 * 60 * 1000),
    },
    {
      id: 'al-living-salto',
      deviceId: 'af-a1b2c3d4e5f6',
      tipo: 'alimentacion',
      estado: 'abierta',
      mensaje: 'Se salteó la toma de las 09:00 en Living: el dispositivo no tenía hora válida.',
      abiertaEn: haceIso(5 * 60 * 60 * 1000),
    },
  ]);

  private readonly lecturas = new Map<string, Lectura>([
    ['af-a1b2c3d4e5f6', lectura('af-a1b2c3d4e5f6', 40, { waterTempC: 25.4, ph: 7.2, tdsPpm: 186 })],
    ['af-b2c3d4e5f607', lectura('af-b2c3d4e5f607', 55, { waterTempC: 24.1, ph: 6.8, tdsPpm: 92 })],
    [
      'af-c3d4e5f60718',
      lectura('af-c3d4e5f60718', 3 * 60 * 60, { waterTempC: 27.8, ph: 7.6, tdsPpm: 240 }),
    ],
  ]);

  private readonly alertas$ = toObservable(this.alertas, { injector: this.injector });

  pecerasDe(usuarioId: string): Observable<PeceraResumen[]> {
    const actual = (): PeceraResumen[] =>
      DISPOSITIVOS.filter((dispositivo) => dispositivo.ownerId === usuarioId).map((dispositivo) =>
        this.resumen(dispositivo),
      );
    return this.alertas$.pipe(
      map(() => actual()),
      startWith(actual()),
    );
  }

  pecera(id: string, usuarioId: string): Observable<PeceraDetalle | null> {
    const actual = (): PeceraDetalle | null => {
      const dispositivo = DISPOSITIVOS.find((item) => item.id === id && item.ownerId === usuarioId);
      if (!dispositivo) {
        return null;
      }
      return { ...this.resumen(dispositivo), horarios: this.horariosDe(id) };
    };
    return this.alertas$.pipe(
      map(() => actual()),
      startWith(actual()),
    );
  }

  alertasDe(usuarioId: string): Observable<AlertaVista[]> {
    const actual = (): AlertaVista[] =>
      this.alertas()
        .filter((alerta) => this.dueno(alerta.deviceId) === usuarioId)
        .map((alerta) => this.vista(alerta));
    return this.alertas$.pipe(
      map(() => actual()),
      startWith(actual()),
    );
  }

  reconocerAlerta(alertaId: string, usuarioId: string): Observable<void> {
    const alerta = this.alertas().find((item) => item.id === alertaId);
    if (!alerta || this.dueno(alerta.deviceId) !== usuarioId) {
      return throwError(() => new PeceraNoDisponibleError('No encontramos esa alerta.'));
    }
    this.alertas.update((lista) =>
      lista.map((item) => (item.id === alertaId ? { ...item, estado: 'reconocida' } : item)),
    );
    return of(undefined).pipe(map(() => undefined));
  }

  especies(): Observable<PerfilEspecie[]> {
    return of([...ESPECIES]);
  }

  especie(slug: string): Observable<PerfilEspecie | null> {
    return of(ESPECIES.find((item) => item.slug === slug) ?? null);
  }

  alimentar(
    deviceId: string,
    usuarioId: string,
    portions: number,
  ): Observable<ComandoAlimentacion> {
    const dispositivo = DISPOSITIVOS.find(
      (item) => item.id === deviceId && item.ownerId === usuarioId,
    );
    if (!dispositivo) {
      return throwError(() => new PeceraNoDisponibleError());
    }
    if (!dispositivo.online) {
      return throwError(() => new PeceraNoDisponibleError('La pecera está sin conexión.'));
    }
    if (!Number.isInteger(portions) || portions < 1 || portions > MAX_PORCIONES) {
      return throwError(
        () => new PeceraNoDisponibleError('La cantidad de porciones no es válida.'),
      );
    }
    return of({
      cmdId: crypto.randomUUID(),
      status: 'sent',
      portions,
      deviceId,
    });
  }

  resumenAdmin(): Observable<ResumenAdmin> {
    return this.alertas$.pipe(
      map(() => this.resumenActual()),
      startWith(this.resumenActual()),
    );
  }

  usuarios(): Observable<Usuario[]> {
    return of([...USUARIOS]);
  }

  usuario(id: string): Observable<Usuario | null> {
    return of(USUARIOS.find((item) => item.id === id) ?? null);
  }

  dispositivosAdmin(): Observable<DispositivoAdmin[]> {
    return of(DISPOSITIVOS.map((dispositivo) => this.adminDe(dispositivo)));
  }

  dispositivoAdmin(id: string): Observable<DispositivoAdmin | null> {
    const dispositivo = DISPOSITIVOS.find((item) => item.id === id);
    return of(dispositivo ? this.adminDe(dispositivo) : null);
  }

  alertasAdmin(): Observable<AlertaVista[]> {
    const actual = (): AlertaVista[] => this.alertas().map((alerta) => this.vista(alerta));
    return this.alertas$.pipe(
      map(() => actual()),
      startWith(actual()),
    );
  }

  private resumenActual(): ResumenAdmin {
    return {
      usuarios: USUARIOS.length,
      dispositivos: DISPOSITIVOS.length,
      enLinea: DISPOSITIVOS.filter((item) => item.online).length,
      sinVincular: DISPOSITIVOS.filter((item) => item.estado === 'unclaimed').length,
      alertasAbiertas: this.alertas().filter((item) => item.estado === 'abierta').length,
      servicios: [
        {
          nombre: 'Backend NestJS',
          estado: 'sin-conectar',
          detalle: 'Todavía no está en este repositorio.',
        },
        {
          nombre: 'PostgreSQL',
          estado: 'sin-conectar',
          detalle: 'La base llega con el backend.',
        },
        {
          nombre: 'Mosquitto',
          estado: 'sin-conectar',
          detalle: 'El broker lo opera el backend, no el navegador.',
        },
      ],
    };
  }

  private resumen(dispositivo: Dispositivo): PeceraResumen {
    const lecturaActual = this.lecturas.get(dispositivo.id) ?? null;
    const vistos = lecturaActual?.ts
      ? new Date(lecturaActual.ts * 1000).toISOString()
      : dispositivo.lastSeen;
    return {
      dispositivo: { ...dispositivo, lastSeen: vistos },
      lectura: lecturaActual,
      proxima: proximaAlimentacion(this.horariosDe(dispositivo.id)),
      especie: ESPECIES.find((item) => item.id === dispositivo.speciesProfileId) ?? null,
      alertasAbiertas: this.alertas().filter(
        (alerta) => alerta.deviceId === dispositivo.id && alerta.estado === 'abierta',
      ).length,
    };
  }

  private horariosDe(deviceId: string): Horario[] {
    return HORARIOS.filter((horario) => horario.deviceId === deviceId);
  }

  private dueno(deviceId: string): string | null {
    return DISPOSITIVOS.find((item) => item.id === deviceId)?.ownerId ?? null;
  }

  private vista(alerta: Alerta): AlertaVista {
    const dispositivo = DISPOSITIVOS.find((item) => item.id === alerta.deviceId);
    return { ...alerta, nombrePecera: dispositivo?.nombre ?? alerta.deviceId };
  }

  private adminDe(dispositivo: Dispositivo): DispositivoAdmin {
    const dueno = USUARIOS.find((item) => item.id === dispositivo.ownerId);
    const especie = ESPECIES.find((item) => item.id === dispositivo.speciesProfileId);
    const lecturaActual = this.lecturas.get(dispositivo.id);
    return {
      ...dispositivo,
      lastSeen: lecturaActual?.ts ? new Date(lecturaActual.ts * 1000).toISOString() : null,
      duenoNombre: dueno?.nombre ?? null,
      duenoEmail: dueno?.email ?? null,
      especieNombre: especie?.nombre ?? null,
    };
  }
}
