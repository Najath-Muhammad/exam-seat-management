import { apiClient } from '../../../services/api/apiClient';
import { LoginResponse, RefreshResponse } from '../types/auth.types';

export const authApi = {
  login: async (credentials: { email: string; passwordPlain?: string; password?: string }) => {
    // Backend expects 'password', but prompt used 'passwordPlain' in one spot, so mapping both just in case
    const payload = {
      email: credentials.email,
      password: credentials.password || credentials.passwordPlain,
    };
    const response = await apiClient.post<LoginResponse>('/auth/login', payload);
    return response.data;
  },

  refresh: async () => {
    const response = await apiClient.post<RefreshResponse>('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};
