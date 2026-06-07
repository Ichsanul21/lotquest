import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Agent, RegisterData } from '../types';

const mockAgent: Agent = {
  id: 1,
  name: 'John Doe',
  username: 'johndoe',
  avatar: null,
  level: 12,
  tier: 'Senior',
  xp: 450,
  xp_next_level: 1000,
  total_commission: 750000,
  total_properties: 5,
  total_transactions: 12,
  rank: 5,
  cabang: 'Jakarta Pusat',
  team: 'Alpha',
  joined_at: '2025-01-15T00:00:00Z',
  referral_code: 'ABCD12',
  badges: [],
  featured_badges: [],
  total_recruit: 3,
  training_completed: 8,
  is_legendary: false,
  created_at: '2025-01-15T00:00:00Z',
  updated_at: '2025-06-07T00:00:00Z',
};

interface AuthContextType {
  agent: Agent | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email?: string, password?: string, remember?: boolean) => Promise<void>;
  register: (data?: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (_email?: string, _password?: string, _remember?: boolean) => {
    setAgent(mockAgent);
  };

  const register = async (_data?: RegisterData) => {
    setAgent(mockAgent);
  };

  const logout = () => {
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
