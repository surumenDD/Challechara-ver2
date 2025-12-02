import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppStore } from './store/slices/types';
import { createUiSlice } from './store/slices/uiSlice';
import { createChatSlice } from './store/slices/chatSlice';
import { createBookSlice } from './store/slices/bookSlice';

const partialize = (state: AppStore) => ({
  books: state.books,
  activeEpisodeId: state.activeEpisodeId,
  selectedEpisodeIds: state.selectedEpisodeIds,
  selectedMaterialIds: state.selectedMaterialIds,
  sourceChats: state.sourceChats,
  materialChats: state.materialChats,
  dictChats: state.dictChats,
  sortOrder: state.sortOrder,
  viewMode: state.viewMode,
  query: state.query,
  ui: state.ui
});

export const useStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createUiSlice(...a),
      ...createChatSlice(...a),
      ...createBookSlice(...a)
    }),
    {
      name: 'app-storage',
      partialize
    }
  )
);

export * from './store/types';
export type { AppStore } from './store/slices/types';
