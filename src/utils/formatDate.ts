// Global date format for the whole app: strictly dd/mm/yyyy.
//
// Backend dates arrive in several shapes (dd-mm-yy like "01-05-26", ISO
// "2026-05-01", already dd/mm/yyyy, or slashed dd/mm/yy). toDDMMYYYY normalises
// any of them to a single dd/mm/yyyy string so every screen renders dates the
// same way. Unrecognised input is returned unchanged rather than throwing.

const pad = (n: number): string => String(n).padStart(2, '0');

// Expand a 2-digit year to 4 digits (26 -> 2026). Years < 70 map to 20xx.
const expandYear = (yy: string): string => {
  if (yy.length === 4) return yy;
  const n = Number(yy);
  if (Number.isNaN(n)) return yy;
  return n < 70 ? `20${pad(n)}` : `19${pad(n)}`;
};

export function toDDMMYYYY(value?: string | null): string {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';

  // ISO first: yyyy-mm-dd (optionally with a time component).
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(raw);
  if (iso) {
    const [, y, m, d] = iso;
    return `${pad(Number(d))}/${pad(Number(m))}/${y}`;
  }

  // dd-mm-yy(yy) or dd/mm/yy(yy) — day-first with - or / separators.
  const dmy = /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/.exec(raw);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${pad(Number(d))}/${pad(Number(m))}/${expandYear(y)}`;
  }

  return raw;
}

// Compact date for table grids: dd-mm-yy (e.g. "18-12-25") — keeps the Date
// column as narrow as possible so the other columns get more room.
export function toDDMMYY(value?: string | null): string {
  const full = toDDMMYYYY(value); // normalise any input shape first
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(full);
  return m ? `${m[1]}-${m[2]}-${m[3].slice(2)}` : full;
}

// Default report start date, ported from the OG .NET app's filter pages
// (FromdatePicker Date="04/01/2017" → 1 April 2017).
export const OG_START_DATE = '2017-04-01';

// Today as ISO YYYY-MM-DD (local time, not UTC).
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Format a JS Date (e.g. "now") as dd/mm/yyyy, optionally with HH:mm appended.
export function dateToDDMMYYYY(date: Date, withTime = false): string {
  const d = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  if (!withTime) return d;
  return `${d} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
