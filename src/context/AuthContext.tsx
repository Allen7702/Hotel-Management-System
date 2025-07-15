'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface User {
  id: number;
  username: string;
  role: 'Receptionist' | 'Manager' | 'Housekeeping';
  property_id: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  handleRefreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  refreshToken: null,
  login: async () => {},
  logout: () => {},
  handleRefreshToken: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedUser && storedToken && storedRefreshToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
    } else if (storedRefreshToken) {
      // Try to refresh token if only refreshToken exists
      handleRefreshToken();
    }
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        const timeUntilExpiry = expiry - Date.now();
        if (timeUntilExpiry < 5 * 60 * 1000) {
          handleRefreshToken();
        }
      } catch (err) {
        console.error('Invalid token format:', err);
        logout();
      }
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      throw new Error('Login failed');
    }
    const data = await response.json();
    setUser(data.user || { id: 1, username, role: 'Manager', property_id: 1 });
    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user || { id: 1, username, role: 'Manager', property_id: 1 }));
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    router.push('/dashboard');
  };

  const handleRefreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      console.error('No refresh token available');
      logout();
      throw new Error('No refresh token');
    }
    try {
      const { data } = await api.post('/users/refresh-token', { refresh_token: storedRefreshToken });
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUser(data.user || user);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user || user));
    } catch (err) {
      console.error('Refresh token failed:', err);
      logout();
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login, logout, handleRefreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};