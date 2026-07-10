import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { APP_MODULES, DEFAULT_BOOKMARKS } from '../data/modules';

const KEY = 'zeel_dashboard_bookmarks';
const VALID = APP_MODULES.map((m) => m.key);

const sanitize = (keys: string[]): string[] => keys.filter((k) => VALID.includes(k));

interface BookmarkState {
  bookmarks: string[];
  loadBookmarks: () => Promise<void>;
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;
}

const persist = (keys: string[]) => {
  SecureStore.setItemAsync(KEY, JSON.stringify(keys)).catch(() => {});
};

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarks: DEFAULT_BOOKMARKS,

  loadBookmarks: async () => {
    try {
      const saved = await SecureStore.getItemAsync(KEY);
      if (saved) set({ bookmarks: sanitize(JSON.parse(saved) as string[]) });
    } catch {
      // keep defaults
    }
  },

  toggleBookmark: (key: string) => {
    const current = get().bookmarks;
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    set({ bookmarks: next });
    persist(next);
  },

  isBookmarked: (key: string) => get().bookmarks.includes(key),
}));
