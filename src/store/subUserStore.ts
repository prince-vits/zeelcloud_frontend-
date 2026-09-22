import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { authApi } from '../services/api';
import type { SubUser } from '../types';
import { registerStoreReset } from './storeRegistry';

const assertAdminToken = () => {
  const { user, token } = useAuthStore.getState();
  const isAdmin = user?.isSubuser === false && user.parentUserId === null;
  if (!isAdmin) throw new Error('Admin access required');
  if (!token) throw new Error('No authentication token available');
  return token;
};

interface SubUserState {
  subUsers: SubUser[];
  isLoading: boolean;
  loaded: boolean;
  fetchSubUsers: () => Promise<void>;
  fetchSubUserById: (id: string) => Promise<SubUser | undefined>;
  createSubUserViaAPI: (data: {
    username: string;
    password: string;
    contact_no: string;
    form_ids: number[];
    first_name?: string;
    last_name?: string;
    email?: string;
    company_name?: string;
    is_sales_order_creation_allowed?: boolean;
  }) => Promise<SubUser>;
  updateSubUserViaAPI: (
    id: string,
    updates: {
      first_name?: string;
      last_name?: string;
      email?: string;
      password?: string;
      is_active?: boolean;
      company_name?: string;
      contact_no?: string;
      form_ids?: number[];
      is_sales_order_creation_allowed?: boolean;
    },
  ) => Promise<SubUser>;
  deactivateSubUserViaAPI: (id: string) => Promise<SubUser>;
  getById: (id: string) => SubUser | undefined;
  reset: () => void;
}

export const useSubUserStore = create<SubUserState>((set, get) => {
  const reset = () => set({ subUsers: [], isLoading: false, loaded: false });
  registerStoreReset(reset);

  return {
    subUsers: [],
  isLoading: false,
  loaded: false,

  fetchSubUsers: async () => {
    set({ isLoading: true });
    const { user, token } = useAuthStore.getState();
    const isAdmin = user?.isSubuser === false && user.parentUserId === null;
    if (!isAdmin) {
      set({ subUsers: [], isLoading: false, loaded: true });
      return;
    }

    try {
      if (!token) throw new Error('No authentication token available');
      const subUsers = await authApi.getSubUsers(token);
      set({ subUsers, isLoading: false, loaded: true });
    } catch {
      set({ subUsers: [], isLoading: false, loaded: true });
    }
  },

  fetchSubUserById: async (id) => {
    try {
      const token = assertAdminToken();
      const subUser = await authApi.getSubUser(token, id);
      set((state) => ({
        subUsers: state.subUsers.some((existing) => existing.id === subUser.id)
          ? state.subUsers.map((existing) => (existing.id === subUser.id ? subUser : existing))
          : [subUser, ...state.subUsers],
      }));
      return subUser;
    } catch {
      return undefined;
    }
  },

  createSubUserViaAPI: async (data) => {
    const token = assertAdminToken();
    const newSubUser = await authApi.createSubUser(token, data);
    set((state) => ({ subUsers: [newSubUser, ...state.subUsers] }));
    return newSubUser;
  },

  updateSubUserViaAPI: async (id, updates) => {
    const token = assertAdminToken();
    const updatedSubUser = await authApi.updateSubUser(token, id, updates);
    set((state) => ({
      subUsers: state.subUsers.map((existing) =>
        existing.id === updatedSubUser.id ? updatedSubUser : existing,
      ),
    }));
    return updatedSubUser;
  },

  deactivateSubUserViaAPI: async (id) => {
    const token = assertAdminToken();
    await authApi.deactivateSubUser(token, id);
    set((state) => ({
      subUsers: state.subUsers.map((u) =>
        u.id === id ? { ...u, isActive: false } : u,
      ),
    }));
    const deactivated = get().getById(id);
    if (!deactivated) throw new Error('Sub user not found after deactivation');
    return deactivated;
  },

  getById: (id) => get().subUsers.find((u) => u.id === id),
  reset,
  };
});
