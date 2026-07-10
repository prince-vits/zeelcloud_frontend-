import { create } from 'zustand';
import { fetchMockSubUsers } from '../data/mockData';
import type { SubUser } from '../types';

interface SubUserState {
  subUsers: SubUser[];
  isLoading: boolean;
  loaded: boolean;
  fetchSubUsers: () => Promise<void>;
  addSubUser: (user: Omit<SubUser, 'id'>) => void;
  updateSubUser: (id: string, updates: Partial<SubUser>) => void;
  deleteSubUser: (id: string) => void;
  toggleActive: (id: string) => void;
  getById: (id: string) => SubUser | undefined;
}

export const useSubUserStore = create<SubUserState>((set, get) => ({
  subUsers: [],
  isLoading: false,
  loaded: false,

  fetchSubUsers: async () => {
    set({ isLoading: true });
    const subUsers = await fetchMockSubUsers();
    set({ subUsers, isLoading: false, loaded: true });
  },

  addSubUser: (user) => {
    const newUser: SubUser = { ...user, id: `su_${Date.now()}` };
    set((s) => ({ subUsers: [newUser, ...s.subUsers] }));
  },

  updateSubUser: (id, updates) => {
    set((s) => ({
      subUsers: s.subUsers.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));
  },

  deleteSubUser: (id) => {
    set((s) => ({ subUsers: s.subUsers.filter((u) => u.id !== id) }));
  },

  toggleActive: (id) => {
    set((s) => ({
      subUsers: s.subUsers.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u)),
    }));
  },

  getById: (id) => get().subUsers.find((u) => u.id === id),
}));
