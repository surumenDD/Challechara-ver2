import { StoreSlice, ChatSlice } from './types';

export const createChatSlice: StoreSlice<ChatSlice> = (set) => ({
  sourceChats: {},
  materialChats: {},
  dictChats: {},
  addSourceChatMessage: (bookId, message) => set((state) => ({
    sourceChats: {
      ...state.sourceChats,
      [bookId]: [...(state.sourceChats[bookId] || []), message]
    }
  })),
  addMaterialChatMessage: (bookId, message) => set((state) => ({
    materialChats: {
      ...state.materialChats,
      [bookId]: [...(state.materialChats[bookId] || []), message]
    }
  })),
  addDictChatMessage: (bookId, message) => set((state) => ({
    dictChats: {
      ...state.dictChats,
      [bookId]: [...(state.dictChats[bookId] || []), message]
    }
  }))
});
