import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Episode = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

export type Material = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
};

export type Book = {
  id: string;
  title: string;
  coverEmoji?: string;
  updatedAt: number;
  sourceCount: number;
  archived?: boolean;
  content?: string;
};

type UIState = {
  leftTab: 'manage' | 'chat';
  rightTab: 'dict' | 'material';
  rightSubTab: 'upload' | 'chat';
  rightPanelOpen: boolean;
};

type AppStore = {
  // UI State
  ui: UIState;
  setLeftTab: (tab: 'manage' | 'chat') => void;
  setRightTab: (tab: 'dict' | 'material') => void;
  setRightSubTab: (tab: 'upload' | 'chat') => void;
  setRightPanelOpen: (open: boolean) => void;

  // Episodes & Materials
  episodes: Record<string, Episode[]>;
  materials: Record<string, Material[]>;
  activeSourceIds: string[];
  activeMaterialIds: string[];
  setActiveSourceIds: (ids: string[]) => void;
  setActiveMaterialIds: (ids: string[]) => void;
  addEpisode: (bookId: string, episode: Episode) => void;
  updateEpisode: (bookId: string, episode: Episode) => void;
  deleteEpisode: (bookId: string, episodeId: string) => void;
  addMaterial: (bookId: string, material: Material) => void;
  deleteMaterial: (bookId: string, materialId: string) => void;

  // Chat
  sourceChats: Record<string, ChatMessage[]>;
  materialChats: Record<string, ChatMessage[]>;
  dictChats: Record<string, ChatMessage[]>;
  addSourceChatMessage: (bookId: string, message: ChatMessage) => void;
  addMaterialChatMessage: (bookId: string, message: ChatMessage) => void;
  addDictChatMessage: (bookId: string, message: ChatMessage) => void;

  // Books
  books: Book[];
  sortOrder: 'newest' | 'oldest' | 'titleAsc' | 'titleDesc';
  viewMode: 'grid' | 'list';
  query: string;
  setSortOrder: (order: 'newest' | 'oldest' | 'titleAsc' | 'titleDesc') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setQuery: (query: string) => void;
  addBook: (book: Book) => void;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;
  duplicateBook: (bookId: string) => void;
  initializeBooks: () => void;

  // Editor
  currentBookId: string | null;
  setCurrentBookId: (bookId: string | null) => void;
  saveBook: (bookId: string, title: string, content: string) => void;
};

// ダミーブック初期データ生成
const generateDummyBooks = (): Book[] => {
  const emojis = ['📚', '✍️', '📖', '📝', '📄', '📓', '📔', '📕', '📗', '📘', '📙', '📋'];
  const titles = [
    '夏の思い出',
    '都市の風景',
    '料理レシピ集',
    '旅行記録',
    '読書ノート',
    'プロジェクト企画',
    '日常エッセイ',
    '創作物語',
    '学習ノート',
    '会議メモ',
    'アイデア帳',
    '写真日記'
  ];

  return Array.from({ length: 12 }, (_, i) => ({
    id: `book-${i + 1}`,
    title: titles[i],
    coverEmoji: emojis[i],
    updatedAt: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000, // 60日以内のランダム
    sourceCount: Math.floor(Math.random() * 3) + 1,
    archived: false,
    content: `<h1>${titles[i]}</h1><p>ここに本文を入力してください...</p>`
  }));
};

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // UI State初期値
      ui: {
        leftTab: 'manage',
        rightTab: 'dict',
        rightSubTab: 'upload',
        rightPanelOpen: false
      },
      setLeftTab: (tab) => set((state) => ({ ui: { ...state.ui, leftTab: tab } })),
      setRightTab: (tab) => set((state) => ({ ui: { ...state.ui, rightTab: tab } })),
      setRightSubTab: (tab) => set((state) => ({ ui: { ...state.ui, rightSubTab: tab } })),
      setRightPanelOpen: (open) => set((state) => ({ ui: { ...state.ui, rightPanelOpen: open } })),

      // Episodes & Materials
      episodes: {},
      materials: {},
      activeSourceIds: [],
      activeMaterialIds: [],
      setActiveSourceIds: (ids) => set({ activeSourceIds: ids }),
      setActiveMaterialIds: (ids) => set({ activeMaterialIds: ids }),
      
      addEpisode: (bookId, episode) => set((state) => ({
        episodes: {
          ...state.episodes,
          [bookId]: [...(state.episodes[bookId] || []), episode]
        }
      })),
      
      updateEpisode: (bookId, episode) => set((state) => ({
        episodes: {
          ...state.episodes,
          [bookId]: (state.episodes[bookId] || []).map(e => 
            e.id === episode.id ? episode : e
          )
        }
      })),
      
      deleteEpisode: (bookId, episodeId) => set((state) => ({
        episodes: {
          ...state.episodes,
          [bookId]: (state.episodes[bookId] || []).filter(e => e.id !== episodeId)
        }
      })),
      
      addMaterial: (bookId, material) => set((state) => ({
        materials: {
          ...state.materials,
          [bookId]: [...(state.materials[bookId] || []), material]
        }
      })),
      
      deleteMaterial: (bookId, materialId) => set((state) => ({
        materials: {
          ...state.materials,
          [bookId]: (state.materials[bookId] || []).filter(m => m.id !== materialId)
        }
      })),

      // Chat
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
      })),

      // Books
      books: [],
      sortOrder: 'newest',
      viewMode: 'grid',
      query: '',
      setSortOrder: (order) => set({ sortOrder: order }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setQuery: (query) => set({ query }),
      
      addBook: (book) => set((state) => ({ books: [...state.books, book] })),
      
      updateBook: (book) => set((state) => ({
        books: state.books.map(b => b.id === book.id ? book : b)
      })),
      
      deleteBook: (bookId) => set((state) => ({
        books: state.books.filter(b => b.id !== bookId)
      })),
      
      duplicateBook: (bookId) => set((state) => {
        const book = state.books.find(b => b.id === bookId);
        if (!book) return state;
        
        const newBook: Book = {
          ...book,
          id: `book-${Date.now()}`,
          title: `${book.title}のコピー`,
          updatedAt: Date.now()
        };
        
        return { books: [...state.books, newBook] };
      }),
      
      initializeBooks: () => set((state) => {
        if (state.books.length === 0) {
          console.log('Initializing books with dummy data');
          return { books: generateDummyBooks() };
        }
        console.log('Books already exist, count:', state.books.length);
        return state;
      }),

      // Editor
      currentBookId: null,
      setCurrentBookId: (bookId) => set({ currentBookId: bookId }),
      
      saveBook: (bookId, title, content) => set((state) => ({
        books: state.books.map(b => 
          b.id === bookId 
            ? { ...b, title, content, updatedAt: Date.now() }
            : b
        )
      }))
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        books: state.books,
        episodes: state.episodes,
        materials: state.materials,
        sourceChats: state.sourceChats,
        materialChats: state.materialChats,
        dictChats: state.dictChats,
        sortOrder: state.sortOrder,
        viewMode: state.viewMode,
        ui: state.ui
      })
    }
  )
);