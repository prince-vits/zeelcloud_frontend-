import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerStoreReset } from './storeRegistry';

// Distinct list of colours the user has used in sales orders. Colours are added
// (manually typed or picked) and, on save, bound into this list — deduped, case-
// insensitively — then persisted so the colour dropdown auto-fills next time.
const BASE_KEY = 'zeel_order_colors';

interface ColorState {
  accountId: string | null;
  colors: string[];
  loaded: boolean;
  load: (accountId: string) => Promise<void>;
  addColors: (incoming: string[]) => void;
  reset: () => void;
}

// Merge new colours into the existing list, trimming blanks and de-duplicating
// case-insensitively while keeping the first-seen spelling.
const mergeDistinct = (existing: string[], incoming: string[]): string[] => {
  const seen = new Map(existing.map((c) => [c.toLowerCase(), c]));
  for (const raw of incoming) {
    const c = raw.trim();
    if (!c) continue;
    const key = c.toLowerCase();
    if (!seen.has(key)) seen.set(key, c);
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
};

export const useColorStore = create<ColorState>((set, get) => {
  let loadVersion = 0;

  const reset = () => {
    loadVersion++;
    set({ accountId: null, colors: [], loaded: false });
  };
  registerStoreReset(reset);

  return {
    accountId: null,
    colors: [],
    loaded: false,

    load: async (accountId: string) => {
      // Allow reloading if account ID changes
      if (get().loaded && get().accountId === accountId) return;
      const currentVersion = ++loadVersion;
      try {
        const raw = await AsyncStorage.getItem(`${BASE_KEY}_${accountId}`);
        if (loadVersion !== currentVersion) return; // Stale request guard

        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        const colors = Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : [];
        set({ accountId, colors, loaded: true });
      } catch {
        if (loadVersion === currentVersion) {
          set({ accountId, colors: [], loaded: true });
        }
      }
    },

    addColors: (incoming: string[]) => {
      const { accountId, colors: current } = get();
      if (!accountId) return; // Prevent saving if not loaded
      const next = mergeDistinct(current, incoming);
      // Only write if something actually changed.
      if (next.length === current.length) return;
      set({ colors: next });
      AsyncStorage.setItem(`${BASE_KEY}_${accountId}`, JSON.stringify(next)).catch(() => {});
    },
    
    reset,
  };
});
