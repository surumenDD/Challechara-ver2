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
  setSortOrder: (order: 'newest' | 'oldest' | 'titleAsc' | 'titleDesc') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setQuery: (query: string) => void;
  setActiveEpisodeId: (episodeId: string | null) => void;
  setSelectedEpisodeIds: (ids: string[]) => void;
  setSelectedMaterialIds: (ids: string[]) => void;
  addBook: (book: Book) => void;
  createBook: (title: string, coverEmoji?: string) => Promise<Book>;
  loadBooksFromBackend: () => Promise<void>;
  refreshBookFromBackend: (bookId: string) => Promise<void>;
  saveProjectFile: (projectId: string, fileId: string, filename: string, content: string) => Promise<ProjectFile | undefined>;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => Promise<void>;
  duplicateBook: (bookId: string) => void;
  initializeBooks: () => void;
  addProjectFile: (bookId: string, file: ProjectFile) => void;
  updateProjectFile: (bookId: string, file: ProjectFile) => Promise<void>;
  renameProjectFile: (bookId: string, fileId: string, oldTitle: string, newTitle: string) => Promise<void>;
  deleteProjectFile: (bookId: string, fileId: string) => Promise<void>;
  setActiveFile: (bookId: string, fileId: string | null) => void;
};

export type AppStore = UiSlice & SourceSlice & MaterialSlice & ChatSlice & BookSlice & EditorSlice;

export type StoreSlice<T> = StateCreator<AppStore, [], [], T>;
