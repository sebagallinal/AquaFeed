import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, AuthState, UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = this.getApiUrl();
  private readonly TOKEN_KEY = 'aquafeed_token';
  private readonly USER_KEY = 'aquafeed_user';

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private getApiUrl(): string {
    // Para producción, usar siempre el dominio correcto
    const hostname = window.location.hostname;
    
    console.log('🔍 Detectando entorno:', { hostname, origin: window.location.origin });
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Desarrollo local
      const apiUrl = 'http://localhost:3000/api';
      console.log('🏠 Modo desarrollo:', apiUrl);
      return apiUrl;
    } else {
      // Producción: usar el mismo dominio pero con /api (a través de Nginx)
      const apiUrl = `${window.location.origin}/api`;
      console.log('🌐 Modo producción:', apiUrl);
      return apiUrl;
    }
  }

  private initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.updateAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Verificar si el token sigue siendo válido
      this.verifyToken().subscribe({
        next: () => {
          // Token válido, mantener sesión
        },
        error: () => {
          // Token inválido, limpiar sesión
          this.logout();
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.setLoading(true);
    
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response.token, response.user);
          this.updateAuthState({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
        }),
        catchError(error => {
          this.setLoading(false);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe({
      complete: () => {
        this.clearAuthData();
        this.updateAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        this.router.navigate(['/login']);
      }
    });
  }

  verifyToken(): Observable<any> {
    const token = this.getStoredToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get(`${this.API_URL}/auth/verify`, { headers })
      .pipe(
        catchError(error => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  // Getters para obtener información del estado actual
  get currentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  get currentToken(): string | null {
    return this.authStateSubject.value.token;
  }

  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  get isLoading(): boolean {
    return this.authStateSubject.value.isLoading;
  }

  // Verificar roles
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isUser(): boolean {
    return this.currentUser?.role === 'user';
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  // Métodos privados para manejo de storage
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private updateAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }

  private setLoading(loading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.updateAuthState({
      ...currentState,
      isLoading: loading
    });
  }

  // Método para obtener headers con autorización
  getAuthHeaders(): HttpHeaders {
    const token = this.currentToken;
    if (token) {
      return new HttpHeaders().set('Authorization', `Bearer ${token}`);
    }
    return new HttpHeaders();
  }

  // Método para hacer peticiones autenticadas
  authenticatedRequest<T>(method: string, endpoint: string, data?: any): Observable<T> {
    const headers = this.getAuthHeaders();
    const url = `${this.API_URL}${endpoint}`;

    switch (method.toLowerCase()) {
      case 'get':
        return this.http.get<T>(url, { headers });
      case 'post':
        return this.http.post<T>(url, data, { headers });
      case 'put':
        return this.http.put<T>(url, data, { headers });
      case 'delete':
        return this.http.delete<T>(url, { headers });
      default:
        return throwError(() => new Error('Método HTTP no soportado'));
    }
  }
}
