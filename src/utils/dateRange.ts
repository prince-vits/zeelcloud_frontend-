// Dynamic period ranges computed at runtime — no hard-coded dates/years.
// Used by register/report filters so defaults always track "now" (and real API data).

export type PeriodKey = 'All' | 'This Week' | 'This Month' | 'This Quarter' | 'This Year';

export const PERIOD_OPTIONS: PeriodKey[] = ['All', 'This Week', 'This Month', 'This Quarter', 'This Year'];

const iso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Returns null for "All" (no date restriction → show everything, latest-first).
export const rangeFor = (period: PeriodKey, ref: Date = new Date()): { from: string; to: string } | null => {
  const to = iso(ref);
  switch (period) {
    case 'All':
      return null;
    case 'This Week': {
      const from = new Date(ref);
      from.setDate(from.getDate() - 6);
      return { from: iso(from), to };
    }
    case 'This Month':
      return { from: iso(new Date(ref.getFullYear(), ref.getMonth(), 1)), to };
    case 'This Quarter': {
      const q = Math.floor(ref.getMonth() / 3) * 3;
      return { from: iso(new Date(ref.getFullYear(), q, 1)), to };
    }
    case 'This Year':
      return { from: iso(new Date(ref.getFullYear(), 0, 1)), to };
  }
};

// Keep only entries within [from,to]; a null range means "no filter".
export const withinRange = (dateISO: string, range: { from: string; to: string } | null): boolean =>
  !range || (dateISO >= range.from && dateISO <= range.to);
