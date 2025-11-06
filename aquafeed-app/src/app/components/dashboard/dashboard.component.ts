import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { AuthService, RealtimeDataService } from '../../services';
import { User, DashboardData } from '../../models';
import { DeviceState } from '../../services/realtime-data.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  dashboardData: DashboardData | null = null;
  devices: DeviceState = {};
  isLoading = true;
  isWebSocketConnected = false;
  lastUpdate: Date = new Date();
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private realtimeDataService: RealtimeDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscribeToAuthState();
    this.loadDashboardData();
    this.initializeRealtimeData();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.realtimeDataService.disconnect();
  }

  private subscribeToAuthState(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.user = authState.user;
        if (!authState.isAuthenticated) {
          this.router.navigate(['/login']);
        }
      });
  }

  private loadDashboardData(): void {
    this.authService.authenticatedRequest<any>('GET', '/dashboard')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.dashboardData = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.isLoading = false;
        }
      });
  }

  private initializeRealtimeData(): void {
    // Conectar (iniciar polling HTTP)
    this.realtimeDataService.connect();

    // Suscribirse al estado de conexión
    this.realtimeDataService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isWebSocketConnected = status;
        console.log('Polling estado:', status ? 'Activo' : 'Inactivo');
      });

    // Suscribirse a los datos de dispositivos
    this.realtimeDataService.devices$
      .pipe(takeUntil(this.destroy$))
      .subscribe(devices => {
        this.devices = devices;
        this.lastUpdate = new Date();
        console.log('Datos de dispositivos actualizados:', devices);
      });
  }

  private startAutoRefresh(): void {
    // Actualizar timestamp cada 5 segundos para mostrar "último refresco"
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Esto es principalmente para mostrar un indicador de "último refresco"
        // Los datos ya se actualizan en tiempo real via WebSocket
        console.log('Verificando actualizaciones...');
      });
  }

  logout(): void {
    this.authService.logout();
  }

  refreshData(): void {
    this.isLoading = true;
    this.loadDashboardData();
  }

  formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Buenos días';
    } else if (hour < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  }

  // Obtener lista de dispositivos
  getDeviceIds(): string[] {
    return Object.keys(this.devices);
  }

  // Obtener datos de agua de un dispositivo
  getWaterData(deviceId: string) {
    return this.devices[deviceId]?.agua || null;
  }

  // Obtener datos de ambiente de un dispositivo
  getAmbientData(deviceId: string) {
    return this.devices[deviceId]?.ambiente || null;
  }

  // Verificar si los datos son recientes
  isDataRecent(deviceId: string, type: 'agua' | 'ambiente'): boolean {
    return this.realtimeDataService.isDeviceDataRecent(deviceId, type);
  }

  // Formatear timestamp
  formatTimestamp(timestamp: string): string {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }

  // Obtener tiempo transcurrido
  getTimeSince(timestamp: string): string {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    return `${Math.floor(diffInSeconds / 3600)}h`;
  }
}
