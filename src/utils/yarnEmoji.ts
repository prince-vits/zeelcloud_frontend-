import type { StockItem } from '../types';

// Maps a yarn item to a fiber emoji for quick visual scanning in the grid.
// Derived from the item's name/quality — nothing hard-coded per row, so it
// works the same way once real API data comes in.
const YARN_EMOJI: { match: string; emoji: string }[] = [
  { match: 'cotton', emoji: '🧶' },
  { match: 'poly', emoji: '🧵' },
  { match: 'viscose', emoji: '💠' },
  { match: 'silk', emoji: '✨' },
  { match: 'linen', emoji: '🌿' },
  { match: 'wool', emoji: '🐑' },
  { match: 'nylon', emoji: '🪢' },
  { match: 'rayon', emoji: '🌀' },
];

export const yarnEmoji = (item: StockItem): string => {
  const hay = `${item.name} ${item.quality}`.toLowerCase();
  return YARN_EMOJI.find((e) => hay.includes(e.match))?.emoji ?? '🧵';
};
