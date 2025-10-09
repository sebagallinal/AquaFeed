import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuthGuard, AdminGuard, LoginGuard } from './guards';

export const routes: Routes = [
  // Ruta por defecto - redirige según el estado de autenticación
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  
  // Ruta de login - solo accesible si no está autenticado
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
    title: 'Iniciar Sesión - AquaFeed'
  },
  
  // Ruta del dashboard - requiere autenticación
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    title: 'Dashboard - AquaFeed'
  },
  
  // Ruta de administración - requiere autenticación y rol admin
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
    title: 'Administración - AquaFeed'
  },
  
  // Ruta wildcard - para manejar rutas no encontradas
  {
    path: '**',
    redirectTo: '/login'
  }
];
