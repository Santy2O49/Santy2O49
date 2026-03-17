import { create } from 'zustand';
import { User, UserRole } from '../types';
import api, { setAuthToken } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { email: string; password: string; full_name: string; phone: string; role: UserRole }) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      setAuthToken(token);
      set({ token, user, isLoading: false });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      setAuthToken(token);
      set({ token, user, isLoading: false });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, error: null });
  },

  setUser: (user) => set({ user }),
  
  clearError: () => set({ error: null }),
}));
