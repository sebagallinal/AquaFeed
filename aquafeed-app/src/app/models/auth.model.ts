export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  deviceId: string;
}

export type UserRole = 'admin' | 'user';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardData {
  stats: {
    totalFeedings: number;
    activeDevices: number;
    lastUpdate: string;
  };
}

export interface AdminData {
  totalUsers: number;
  systemHealth: string;
  serverUptime: number;
  adminFeatures: string[];
}
