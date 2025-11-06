import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DeviceData {
  deviceId: string;
  type: 'agua' | 'ambiente';
  data: {
    temperatura?: number;
    ph?: number;
    oxigeno?: number;
    turbidez?: number;
    humedad?: number;
    temperaturaAmbiente?: number;
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
  private socket: Socket | null = null;
  private devicesSubject = new BehaviorSubject<DeviceState>({});
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  constructor() {}

  // Observable para los datos de dispositivos
  get devices$(): Observable<DeviceState> {
    return this.devicesSubject.asObservable();
  }

  // Observable para el estado de conexión
  get connectionStatus$(): Observable<boolean> {
    return this.connectionStatusSubject.asObservable();
  }

  // Conectar al WebSocket
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const serverUrl = environment.websocketUrl;

    console.log('🔗 Conectando a WebSocket:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('🔗 Conectado al WebSocket servidor');
      this.connectionStatusSubject.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Desconectado del WebSocket servidor');
      this.connectionStatusSubject.next(false);
    });

    // Recibir estado inicial de dispositivos
    this.socket.on('initial-device-state', (deviceState: DeviceState) => {
      console.log('📡 Estado inicial de dispositivos recibido:', deviceState);
      this.devicesSubject.next(deviceState);
    });

    // Recibir actualizaciones en tiempo real
    this.socket.on('device-data', (deviceData: DeviceData) => {
      console.log('📊 Nuevos datos de dispositivo:', deviceData);
      
      const currentDevices = this.devicesSubject.value;
      const updatedDevices = { ...currentDevices };
      
      if (!updatedDevices[deviceData.deviceId]) {
        updatedDevices[deviceData.deviceId] = {};
      }
      
      updatedDevices[deviceData.deviceId][deviceData.type] = deviceData.data;
      
      this.devicesSubject.next(updatedDevices);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      this.connectionStatusSubject.next(false);
    });
  }

  // Desconectar del WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
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
