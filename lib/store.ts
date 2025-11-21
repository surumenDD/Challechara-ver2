import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppStore } from './store/slices/types';
import { createUiSlice } from './store/slices/uiSlice';
import { createSourceSlice } from './store/slices/sourceSlice';
import { createMaterialSlice } from './store/slices/materialSlice';
import { createChatSlice } from './store/slices/chatSlice';
import { createBookSlice } from './store/slices/bookSlice';
import { createEditorSlice } from './store/slices/editorSlice';

const partialize = (state: AppStore) => ({
  books: state.books,
  episodes: state.episodes,
  materials: state.materials,
  sourceChats: state.sourceChats,
  materialChats: state.materialChats,
  dictChats: state.dictChats,
  sortOrder: state.sortOrder,
  viewMode: state.viewMode,
  ui: state.ui
});

export const useStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createUiSlice(...a),
      ...createSourceSlice(...a),
      ...createMaterialSlice(...a),
      ...createChatSlice(...a),
      ...createBookSlice(...a),
      ...createEditorSlice(...a)
    }),
    {
      name: 'app-storage',
      partialize
    }
  )
);

export * from './store/types';
export type { AppStore } from './store/slices/types';
