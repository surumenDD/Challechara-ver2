import { StateCreator } from 'zustand';
import { Book, ChatMessage, Episode, Material, ProjectFile, UIState } from '../types';

export type UiSlice = {
  ui: UIState;
  setLeftTab: (tab: 'files' | 'chat') => void;
  setRightTab: (tab: 'dict' | 'material') => void;
  setRightSubTab: (tab: 'upload' | 'chat') => void;
  setRightPanelOpen: (open: boolean) => void;
};

export type SourceSlice = {
  episodes: Record<string, Episode[]>;
  activeSourceIds: string[];
  setActiveSourceIds: (ids: string[]) => void;
  addEpisode: (bookId: string, episode: Episode) => void;
  updateEpisode: (bookId: string, episode: Episode) => void;
  deleteEpisode: (bookId: string, episodeId: string) => void;
};

export type MaterialSlice = {
  materials: Record<string, Material[]>;
  activeMaterialIds: string[];
  setActiveMaterialIds: (ids: string[]) => void;
  addMaterial: (bookId: string, material: Material) => void;
  addMaterialFromFile: (bookId: string, file: File) => Promise<void>;
  loadMaterialsFromBackend: (bookId: string) => Promise<void>;
  deleteMaterial: (bookId: string, materialId: string) => void;
};

export type ChatSlice = {
  sourceChats: Record<string, ChatMessage[]>;
  materialChats: Record<string, ChatMessage[]>;
  dictChats: Record<string, ChatMessage[]>;
  addSourceChatMessage: (bookId: string, message: ChatMessage) => void;
  addMaterialChatMessage: (bookId: string, message: ChatMessage) => void;
  addDictChatMessage: (bookId: string, message: ChatMessage) => void;
};

export type EditorSlice = {
  currentBookId: string | null;
  setCurrentBookId: (bookId: string | null) => void;
  saveBook: (bookId: string, title: string, content: string) => void;
};

export type BookSlice = {
  books: Book[];
  sortOrder: 'newest' | 'oldest' | 'titleAsc' | 'titleDesc';
  viewMode: 'grid' | 'list';
  query: string;
  setSortOrder: (order: 'newest' | 'oldest' | 'titleAsc' | 'titleDesc') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setQuery: (query: string) => void;
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
