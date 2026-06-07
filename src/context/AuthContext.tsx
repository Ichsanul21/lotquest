import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../api/client';
import type { Agent, RegisterData } from '../types';

interface AuthContextType {
  agent: Agent | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      api.setToken(token);
      api.get<{ data: Agent }>('/auth/me')
        .then(res => setAgent(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, remember = false) => {
    const res = await api.post<{ token: string; data: Agent }>('/auth/login', { email, password });
    if (remember) {
      localStorage.setItem('token', res.token);
    } else {
      sessionStorage.setItem('token', res.token);
    }
    api.setToken(res.token);
    setAgent(res.data);
  };

  const register = async (data: RegisterData) => {
    const res = await api.post<{ token: string; data: Agent }>('/auth/register', data);
    localStorage.setItem('token', res.token);
    api.setToken(res.token);
    setAgent(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    api.setToken(null);
    setAgent(null);
  };

  return (
    <AuthContext.Provider value={{ agent, isLoading, isAuthenticated: !!agent, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
