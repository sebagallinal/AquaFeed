import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DeviceData {
  deviceId: string;
  type: 'agua' | 'ambiente';
  data: {
    // Datos de agua
    tempAgua?: number;
    temperatura?: number;
    ph?: number;
    minerales?: number;
    oxigeno?: number;
    turbidez?: number;
    // Datos de ambiente
    humAmb?: number;
    tempAmb?: number;
    humedad?: number;
    temperaturaAmbiente?: number;
    // Metadata
    id?: string;
    ts: string;
  };
}

export interface DeviceState {
  [deviceId: string]: {
    agua?: DeviceData['data'];
    ambiente?: DeviceData['data'];
  };
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeDataService {
  private devicesSubject = new BehaviorSubject<DeviceState>({});
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private pollingSubscription?: Subscription;
  private readonly POLL_INTERVAL = 5000; // 5 segundos

  constructor(private http: HttpClient) {}

  // Observable para los datos de dispositivos
  get devices$(): Observable<DeviceState> {
    return this.devicesSubject.asObservable();
  }

  // Observable para el estado de conexión
  get connectionStatus$(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  // Conectar (iniciar polling)
  connect(): void {
    if (this.pollingSubscription && !this.pollingSubscription.closed) {
      return; // Ya está conectado
    }

    console.log('🔗 Iniciando polling de datos cada 5 segundos...');
    this.connectionStatusSubject.next(true);

    // Hacer primera consulta inmediatamente
    this.fetchDeviceData();

    // Luego consultar cada 5 segundos
    this.pollingSubscription = interval(this.POLL_INTERVAL)
      .pipe(
        switchMap(() => this.getDevicesFromAPI())
      )
      .subscribe({
        next: (response) => {
          this.updateDeviceState(response.devices);
        },
        error: (error) => {
          console.error('❌ Error al obtener datos de dispositivos:', error);
          this.connectionStatusSubject.next(false);
        }
      });
  }

  // Desconectar (detener polling)
  disconnect(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
      this.connectionStatusSubject.next(false);
      console.log('🔌 Polling detenido');
    }
  }

  // Obtener datos del API
  private getDevicesFromAPI(): Observable<{ devices: DeviceState }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<{ devices: DeviceState }>(
      `${environment.apiUrl}/devices/all`,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error fetching device data:', error);
        throw error;
      })
    );
  }

  // Fetch inicial
  private fetchDeviceData(): void {
    this.getDevicesFromAPI().subscribe({
      next: (response) => {
        console.log('📡 Estado inicial de dispositivos recibido:', response.devices);
        this.updateDeviceState(response.devices);
        this.connectionStatusSubject.next(true);
      },
      error: (error) => {
        console.error('❌ Error al cargar datos iniciales:', error);
        this.connectionStatusSubject.next(false);
      }
    });
  }

  // Actualizar estado de dispositivos
  private updateDeviceState(devices: DeviceState): void {
    this.devicesSubject.next(devices);
    console.log('📊 Datos de dispositivos actualizados:', devices);
  }

  // Obtener dispositivos del estado actual
  getCurrentDevices(): DeviceState {
    return this.devicesSubject.value;
  }

  // Obtener datos específicos de un dispositivo
  getDeviceData(deviceId: string): { agua?: DeviceData['data']; ambiente?: DeviceData['data'] } | null {
    const devices = this.getCurrentDevices();
    return devices[deviceId] || null;
  }

  // Obtener lista de IDs de dispositivos disponibles
  getAvailableDeviceIds(): string[] {
    const devices = this.getCurrentDevices();
    return Object.keys(devices);
  }

  // Verificar si hay datos recientes (últimos 30 segundos)
  isDeviceDataRecent(deviceId: string, type: 'agua' | 'ambiente'): boolean {
    const deviceData = this.getDeviceData(deviceId);
    if (!deviceData || !deviceData[type]) {
      return false;
    }

    const lastUpdate = new Date(deviceData[type]!.ts);
    const now = new Date();
    const diffInSeconds = (now.getTime() - lastUpdate.getTime()) / 1000;
    
    return diffInSeconds <= 30; // Datos son recientes si tienen menos de 30 segundos
  }
}
