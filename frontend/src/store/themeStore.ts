import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentText: string;
  headerBg: string;
  tabBarBg: string;
  inputBg: string;
  danger: string;
  success: string;
  warning: string;
}

const darkTheme: ThemeColors = {
  background: '#111111',
  surface: '#1e1e1e',
  surfaceAlt: '#2a2a2a',
  border: '#333333',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#6b7280',
  accent: '#c8ff00',
  accentText: '#111111',
  headerBg: '#1a1a1a',
  tabBarBg: '#141414',
  inputBg: '#1e1e1e',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#fbbf24',
};

const lightTheme: ThemeColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  surfaceAlt: '#f0f0f0',
  border: '#e2e2e2',
  text: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  accent: '#2563eb',
  accentText: '#ffffff',
  headerBg: '#ffffff',
  tabBarBg: '#ffffff',
  inputBg: '#f9fafb',
  danger: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
};

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  colors: darkTheme,
  toggleTheme: () =>
    set((state) => ({
      mode: state.mode === 'dark' ? 'light' : 'dark',
      colors: state.mode === 'dark' ? lightTheme : darkTheme,
    })),
  setTheme: (mode: ThemeMode) =>
    set({ mode, colors: mode === 'dark' ? darkTheme : lightTheme }),
}));
