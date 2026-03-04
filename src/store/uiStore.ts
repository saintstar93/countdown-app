import { create } from 'zustand';
import type { ImageSearchResult } from '~/types/api';

// Non-persisted store for transient UI state (e.g. passing data between modals)
interface UiStore {
  pendingImage: ImageSearchResult | null;
  setPendingImage: (img: ImageSearchResult | null) => void;
}

export const useUiStore = create<UiStore>()((set) => ({
  pendingImage: null,
  setPendingImage: (img) => set({ pendingImage: img }),
}));
