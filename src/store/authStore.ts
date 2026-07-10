import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { mockUser } from '../data/mockData';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const TOKEN_KEY = 'zeel_auth_token';
const USER_KEY = 'zeel_user_data';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,

  login: async (username: string, password: string): Promise<boolean> => {
    if (!username.trim() || !password.trim()) {
      return false;
    }
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const token = `mock_token_${Date.now()}`;
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(mockUser));
    } catch {
      // SecureStore may fail in some environments — continue anyway
    }
    set({ user: mockUser, isLoggedIn: true, isLoading: false });
    return true;
  },

  logout: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
    set({ user: null, isLoggedIn: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);
      if (token && userData) {
        const user = JSON.parse(userData) as User;
        set({ user, isLoggedIn: true });
      }
    } catch {
      // No stored session
    }
  },

  updateProfile: async (updates: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated: User = { ...current, ...updates };
    set({ user: updated });
    try {
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated));
    } catch {
      // SecureStore may fail in some environments — state is already updated
    }
  },
}));
