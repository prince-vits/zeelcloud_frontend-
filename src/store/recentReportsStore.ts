import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { AppStackParamList } from '../types';
import { registerStoreReset } from './storeRegistry';

const BASE_KEY = 'zeel_recent_reports';
const MAX = 6; // keep only the most recently opened reports

export interface RecentReport {
  route: keyof AppStackParamList;
  label: string;
  icon: string;
  color: string;
  at: number; // epoch ms — when it was last opened
}

interface RecentReportState {
  accountId: string | null;
  recents: RecentReport[];
  loadRecents: (accountId: string) => Promise<void>;
  recordReport: (r: Omit<RecentReport, 'at'>) => void;
  clearRecents: () => void;
  reset: () => void;
}

const persist = (accountId: string, list: RecentReport[]) => {
  SecureStore.setItemAsync(`${BASE_KEY}_${accountId}`, JSON.stringify(list)).catch(() => {});
};

export const useRecentReportsStore = create<RecentReportState>((set, get) => {
  let loadVersion = 0;

  const reset = () => {
    loadVersion++;
    set({ accountId: null, recents: [] });
  };
  registerStoreReset(reset);

  return {
    accountId: null,
    recents: [],

    loadRecents: async (accountId: string) => {
      const currentVersion = ++loadVersion;
      try {
        const saved = await SecureStore.getItemAsync(`${BASE_KEY}_${accountId}`);
        if (loadVersion !== currentVersion) return; // Stale request guard

        if (saved) {
          set({ accountId, recents: JSON.parse(saved) as RecentReport[] });
        } else {
          set({ accountId, recents: [] });
        }
      } catch {
        if (loadVersion === currentVersion) {
          set({ accountId, recents: [] });
        }
      }
    },

    // Move the opened report to the front, dedupe by route, cap the list.
    recordReport: (r) => {
      const { accountId, recents: current } = get();
      if (!accountId) return;
      const entry: RecentReport = { ...r, at: Date.now() };
      const next = [entry, ...current.filter((x) => x.route !== r.route)].slice(0, MAX);
      set({ recents: next });
      persist(accountId, next);
    },

    clearRecents: () => {
      const { accountId } = get();
      if (!accountId) return;
      set({ recents: [] });
      persist(accountId, []);
    },
    reset,
  };
});
