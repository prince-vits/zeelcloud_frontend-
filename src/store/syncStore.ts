import { create } from 'zustand';
import { dateToDDMMYYYY } from '../utils/formatDate';

// Global "last sync" clock. markSynced() is called from the central apiFetch on
// every successful API response, so `lastSynced` genuinely reflects the last time
// real data was fetched — on ANY screen — instead of only when the Companies tab
// happened to reload the company list.
//
// The stamp has minute precision (dd/mm/yyyy HH:mm), and we only write to the store
// when that string actually changes, so the memoized LastSyncBadge re-renders at
// most once a minute no matter how many requests fire.
interface SyncState {
  lastSynced: string;
  markSynced: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  lastSynced: '',
  markSynced: () => {
    const stamp = dateToDDMMYYYY(new Date(), true);
    if (stamp !== get().lastSynced) set({ lastSynced: stamp });
  },
}));
