import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthState } from '../types/auth.types';
import { authApi } from '../services/authApi';
import { setToken } from '../services/tokenManager';

interface AuthContextType extends AuthState {
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      
      const refreshData = await authApi.refresh();
      const token = refreshData.data.accessToken;
      
      
      setToken(token);

      
      const meData = await authApi.getMe();
      
      setAuthState({
        accessToken: token,
        user: meData.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setToken(null);
      setAuthState({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();

    
    const handleRefreshFailed = () => {
      setToken(null);
      setAuthState({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    };

    window.addEventListener('auth:refresh-failed', handleRefreshFailed);
    return () => window.removeEventListener('auth:refresh-failed', handleRefreshFailed);
  }, [checkAuth]);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authApi.login(credentials);
    const { accessToken, user } = response.data;
    setToken(accessToken);
    setAuthState({
      accessToken,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setAuthState({
        accessToken: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
