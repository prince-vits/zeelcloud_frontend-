import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
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
  token: null,
  isLoggedIn: false,
  isLoading: false,

  login: async (login: string, password: string): Promise<boolean> => {
    if (!login.trim() || !password.trim()) {
      return false;
    }
    set({ isLoading: true });
    try {
      const { token } = await authApi.login(login.trim(), password);
      const user = await authApi.getProfile(token);
      set({ user, token, isLoggedIn: true, isLoading: false });

      // Persist the session for the next app launch, but do not block a
      // successful login if secure storage is unavailable on this device.
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      } catch {
        // The signed-in state remains available for the current app session.
      }
      return true;
    } catch {
      // SecureStore may fail in some environments — continue anyway
    }
    set({ isLoading: false });
    return false;
  },

  logout: () => {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
    set({ user: null, token: null, isLoggedIn: false });
  },

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userData = await SecureStore.getItemAsync(USER_KEY);
      if (token && userData) {
        const user = JSON.parse(userData) as User;
        set({ user, token, isLoggedIn: true });
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
