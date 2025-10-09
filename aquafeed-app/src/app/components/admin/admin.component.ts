import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services';
import { User, AdminData } from '../../models';

@Component({
  selector: 'app-admin',
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, OnDestroy {
  user: User | null = null;
  adminData: AdminData | null = null;
  allUsers: User[] = [];
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscribeToAuthState();
    this.loadAdminData();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToAuthState(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authState => {
        this.user = authState.user;
        if (!authState.isAuthenticated) {
          this.router.navigate(['/login']);
        } else if (authState.user?.role !== 'admin') {
          this.router.navigate(['/dashboard']);
        }
      });
  }

  private loadAdminData(): void {
    this.authService.authenticatedRequest<any>('GET', '/admin/console')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.adminData = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading admin data:', error);
          this.isLoading = false;
        }
      });
  }

  private loadUsers(): void {
    this.authService.authenticatedRequest<any>('GET', '/admin/users')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allUsers = response.users;
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      });
  }

  logout(): void {
    this.authService.logout();
  }

  refreshData(): void {
    this.isLoading = true;
    this.loadAdminData();
    this.loadUsers();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatUptime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  }

  getSystemStatusColor(): string {
    return this.adminData?.systemHealth === 'OK' ? '#27ae60' : '#e74c3c';
  }

  getUserRoleLabel(role: string): string {
    return role === 'admin' ? 'Administrador' : 'Usuario';
  }

  getUserRoleColor(role: string): string {
    return role === 'admin' ? '#e74c3c' : '#3498db';
  }
}
