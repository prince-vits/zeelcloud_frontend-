// App-wide number rule: show AT MOST two decimals, and drop them when they are
// zero — 1234.567 → 1,234.57 · 1234.5 → 1,234.5 · 1234.00 → 1,234
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatCurrency = (amount: number): string => inrFormatter.format(amount);

// Plain number (no currency symbol), same precision rule — for grid cells/totals.
const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

export const formatNumber2 = (value: number): string => numberFormatter.format(value);

// Percentage with the same rule (12.5 → "12.5", 12 → "12").
export const formatPercent = (value: number): string => numberFormatter.format(value);
