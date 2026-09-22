import { create } from 'zustand';
import { registerStoreReset } from './storeRegistry';

interface PdfState {
  isVisible: boolean;
  htmlContent: string;
  openPreview: (html: string) => void;
  closePreview: () => void;
  reset: () => void;
}

export const usePdfStore = create<PdfState>((set) => {
  const reset = () => set({ isVisible: false, htmlContent: '' });
  registerStoreReset(reset);

  return {
    isVisible: false,
    htmlContent: '',
  openPreview: (html) => set({ isVisible: true, htmlContent: html }),
  closePreview: () => set({ isVisible: false, htmlContent: '' }),
  reset,
  };
});
