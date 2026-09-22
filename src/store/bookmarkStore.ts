import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { APP_MODULES, DEFAULT_BOOKMARKS } from '../data/modules';
import { registerStoreReset } from './storeRegistry';

const BASE_KEY = 'zeel_dashboard_bookmarks';
const VALID = APP_MODULES.map((m) => m.key);

const sanitize = (keys: string[]): string[] => keys.filter((k) => VALID.includes(k));

interface BookmarkState {
  accountId: string | null;
  bookmarks: string[];
  loadBookmarks: (accountId: string) => Promise<void>;
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;
  reset: () => void;
}

const persist = (accountId: string, keys: string[]) => {
  SecureStore.setItemAsync(`${BASE_KEY}_${accountId}`, JSON.stringify(keys)).catch(() => {});
};

export const useBookmarkStore = create<BookmarkState>((set, get) => {
  let loadVersion = 0;

  const reset = () => {
    loadVersion++;
    set({ accountId: null, bookmarks: DEFAULT_BOOKMARKS });
  };
  registerStoreReset(reset);

  return {
    accountId: null,
    bookmarks: DEFAULT_BOOKMARKS,

    loadBookmarks: async (accountId: string) => {
      const currentVersion = ++loadVersion;
      try {
        const saved = await SecureStore.getItemAsync(`${BASE_KEY}_${accountId}`);
        if (loadVersion !== currentVersion) return; // Stale request guard

        if (saved) {
          set({ accountId, bookmarks: sanitize(JSON.parse(saved) as string[]) });
        } else {
          set({ accountId, bookmarks: DEFAULT_BOOKMARKS });
        }
      } catch {
        if (loadVersion === currentVersion) {
          set({ accountId, bookmarks: DEFAULT_BOOKMARKS });
        }
      }
    },

    toggleBookmark: (key: string) => {
      const { accountId, bookmarks: current } = get();
      if (!accountId) return; // Prevent saving if not loaded
      const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
      set({ bookmarks: next });
      persist(accountId, next);
    },

    isBookmarked: (key: string) => get().bookmarks.includes(key),
    reset,
  };
});
