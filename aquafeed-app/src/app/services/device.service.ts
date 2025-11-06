import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FeedResponse {
  ok: boolean;
  topic?: string;
  msg?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) {}

  // Enviar comando de alimentación a un dispositivo
  feedDevice(deviceId: string): Observable<FeedResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<FeedResponse>(
      `${environment.apiUrl}/devices/${deviceId}/alimentar`,
      {},
      { headers }
    );
  }
}
