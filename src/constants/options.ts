// Static configuration option lists (master data / enums).
// Kept separate from mock data so screens depend on stable config, not on the
// mock data module. When the backend serves these as master data, swap the
// values here (or route through a masterApi) without touching screens.

// Module permissions a sub user can be granted (matches the design's lists).
export const PERMISSION_MODULES: string[] = [
  'Stock Details',
  'Sales Outstanding / Data Entry',
  'Purchase Outstanding',
  'General Purchase Outstanding',
  'Sales Register',
  'Purchase Register',
  'Work / Cash Ledger',
  'Party Ledger',
  'Non Issue Stock',
  'Yarn Stock',
  'Beam Stock',
];

// Sales Order — item sort options
export const SORT_OPTIONS: string[] = [
  'Cotton Yarn Silk',
  'Polyester Blend',
  'Pure Silk',
  'Viscose Rayon',
  'Georgette',
];

// Sales Order — colour options
export const COLOR_OPTIONS: string[] = [
  'Navy Blue',
  'Maroon',
  'Emerald Green',
  'Golden Yellow',
  'Black',
  'White',
];
