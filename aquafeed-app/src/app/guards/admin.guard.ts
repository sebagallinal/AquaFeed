import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated && authState.user?.role === 'admin') {
          return true;
        } else if (authState.isAuthenticated && authState.user?.role === 'user') {
          // Usuario autenticado pero sin permisos de admin
          this.router.navigate(['/dashboard']);
          return false;
        } else {
          // Usuario no autenticado
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
