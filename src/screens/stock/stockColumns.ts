import type { StockColumn } from './StockReportView';

// Shared column definitions for the stock / non-issue data grids so both
// modules render identical layouts from a single source of truth.
export const yarnColumns: StockColumn[] = [
  { key: 'name', label: 'Item Name', width: 170 },
  { key: 'crtn', label: 'Crtn', width: 70 },
  { key: 'netWeight', label: 'Net Weight', width: 100 },
  { key: 'cheese', label: 'Cheese', width: 80 },
];

// Yarn "Quality + Lot No. + Grade Wise" variant — same metrics plus the Lot No.
export const yarnLotGradeColumns: StockColumn[] = [
  { key: 'name', label: 'Item Name', width: 170 },
  { key: 'lotNo', label: 'Lot No', width: 90 },
  { key: 'crtn', label: 'Crtn', width: 70 },
  { key: 'netWeight', label: 'Net Weight', width: 100 },
  { key: 'cheese', label: 'Cheese', width: 80 },
];

export const grayColumns: StockColumn[] = [
  { key: 'name', label: 'Item Name', width: 150 },
  { key: 'taka', label: 'Taka', width: 70 },
  { key: 'meter', label: 'Meter', width: 80 },
  { key: 'weight', label: 'Weight', width: 80 },
  { key: 'avgWt', label: 'Avg. Wt', width: 80, decimals: 2 },
  { key: 'pallu', label: 'Pallu', width: 70 },
];

export const beamColumns: StockColumn[] = [
  { key: 'name', label: 'Item Name', width: 150 },
  { key: 'beam', label: 'Beam', width: 70 },
  { key: 'meter', label: 'Meter', width: 90 },
  { key: 'weight', label: 'Weight', width: 90 },
];
