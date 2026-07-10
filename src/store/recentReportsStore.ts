import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { AppStackParamList } from '../types';

const KEY = 'zeel_recent_reports';
const MAX = 6; // keep only the most recently opened reports

export interface RecentReport {
  route: keyof AppStackParamList;
  label: string;
  icon: string;
  color: string;
  at: number; // epoch ms — when it was last opened
}

interface RecentReportState {
  recents: RecentReport[];
  loadRecents: () => Promise<void>;
  recordReport: (r: Omit<RecentReport, 'at'>) => void;
  clearRecents: () => void;
}

const persist = (list: RecentReport[]) => {
  SecureStore.setItemAsync(KEY, JSON.stringify(list)).catch(() => {});
};

export const useRecentReportsStore = create<RecentReportState>((set, get) => ({
  recents: [],

  loadRecents: async () => {
    try {
      const saved = await SecureStore.getItemAsync(KEY);
      if (saved) set({ recents: JSON.parse(saved) as RecentReport[] });
    } catch {
      // keep empty
    }
  },

  // Move the opened report to the front, dedupe by route, cap the list.
  recordReport: (r) => {
    const entry: RecentReport = { ...r, at: Date.now() };
    const next = [entry, ...get().recents.filter((x) => x.route !== r.route)].slice(0, MAX);
    set({ recents: next });
    persist(next);
  },

  clearRecents: () => {
    set({ recents: [] });
    persist([]);
  },
}));
