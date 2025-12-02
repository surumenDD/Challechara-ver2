import { StateCreator } from 'zustand';
import { Book, ChatMessage, UIState } from '../types';

export type UiSlice = {
  ui: UIState;
  setLeftTab: (tab: 'files' | 'chat') => void;
  setRightTab: (tab: 'dict' | 'material') => void;
  setRightSubTab: (tab: 'upload' | 'chat') => void;
  setRightPanelOpen: (open: boolean) => void;
};

export type ChatSlice = {
  sourceChats: Record<string, ChatMessage[]>;
  materialChats: Record<string, ChatMessage[]>;
  dictChats: Record<string, ChatMessage[]>;
  addSourceChatMessage: (bookId: string, message: ChatMessage) => void;
  addMaterialChatMessage: (bookId: string, message: ChatMessage) => void;
  addDictChatMessage: (bookId: string, message: ChatMessage) => void;
};

export type BookSlice = {
  books: Book[];
  activeEpisodeId: string | null;
  selectedEpisodeIds: string[];
  selectedMaterialIds: string[];
  sortOrder: 'newest' | 'oldest' | 'a-z';
  viewMode: 'grid' | 'list';
  query: string;
  setSortOrder: (order: 'newest' | 'oldest' | 'a-z') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setQuery: (query: string) => void;
  setActiveEpisodeId: (episodeId: string | null) => void;
  setSelectedEpisodeIds: (ids: string[]) => void;
  setSelectedMaterialIds: (ids: string[]) => void;
  addBook: (book: Book) => void;
  createBook: (title: string, description?: string) => Promise<Book>;
  loadBooksFromBackend: () => Promise<void>;
  refreshBookFromBackend: (bookId: string) => Promise<void>;
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  initializeBooks: () => void;
};

export type AppStore = UiSlice & ChatSlice & BookSlice;

export type StoreSlice<T> = StateCreator<AppStore, [], [], T>;
