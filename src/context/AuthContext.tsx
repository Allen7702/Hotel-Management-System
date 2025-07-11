'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { refreshToken } from '../services/api';

interface User {
  id: number;
  username: string;
  role: string;
  property_id: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshTokens: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  refreshTokens: null,
  login: async () => { },
  logout: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokens, setRefreshToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedUser && storedToken && storedRefreshToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const timeUntilExpiry = expiry - Date.now();
      if (timeUntilExpiry < 5 * 60 * 1000) { // Refresh if < 5 minutes left
        handleRefreshToken();
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
    setUser(data.user);
    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    router.push('/');
  };

  const handleRefreshToken = async () => {
    if (!refreshTokens) return;
    try {
      const data = await refreshToken(refreshTokens);
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUser(data.user);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Refresh token failed:', err);
      logout();
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshTokens, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);