export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
