import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProjectFile = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

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
  files?: ProjectFile[];
  activeFileId?: string | null;
};

type UIState = {
  leftTab: 'files' | 'chat';
  rightTab: 'dict' | 'material';
  rightSubTab: 'upload' | 'chat';
  rightPanelOpen: boolean;
};

type AppStore = {
  // UI State
  ui: UIState;
  setLeftTab: (tab: 'files' | 'chat') => void;
  setRightTab: (tab: 'dict' | 'material') => void;
  setRightSubTab: (tab: 'upload' | 'chat') => void;
  setRightPanelOpen: (open: boolean) => void;

  // Project Files
  addProjectFile: (bookId: string, file: ProjectFile) => void;
  updateProjectFile: (bookId: string, file: ProjectFile) => Promise<void>;
  renameProjectFile: (bookId: string, fileId: string, oldTitle: string, newTitle: string) => Promise<void>;
  deleteProjectFile: (bookId: string, fileId: string) => Promise<void>;
  setActiveFile: (bookId: string, fileId: string | null) => void;

  // Episodes & Materials (legacy)
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
  createBook: (title: string, coverEmoji?: string) => Promise<Book>;
  loadBooksFromBackend: () => Promise<void>;
  refreshBookFromBackend: (bookId: string) => Promise<void>;
  saveProjectFile: (projectId: string, filename: string, content: string) => Promise<any>;
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

  const books = Array.from({ length: 12 }, (_, i) => {
    const mainFile: ProjectFile = {
      id: `file-${i + 1}-main`,
      title: `${titles[i]}.txt`,
      content: `# ${titles[i]}\n\nここに本文を入力してください...\n\n## メモ\n- アイデア1\n- アイデア2`,
      createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    };

    const memoFile: ProjectFile = {
      id: `file-${i + 1}-memo`,
      title: `${titles[i]}_メモ.txt`,
      content: `# ${titles[i]}のメモ\n\n参考資料や思いついたことを記録します。\n\n- キーワード: ${titles[i]}\n- 重要度: ★★★`,
      createdAt: Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - Math.random() * 25 * 24 * 60 * 60 * 1000
    };

    return {
      id: `book-${i + 1}`,
      title: titles[i],
      coverEmoji: emojis[i],
      updatedAt: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000, // 60日以内のランダム
      sourceCount: 2,
      archived: false,
      content: `<h1>${titles[i]}</h1><p>ここに本文を入力してください...</p>`,
      files: [mainFile, memoFile],
      activeFileId: mainFile.id
    };
  });

  // バックエンドのサンプルプロジェクトと対応するテストブックを追加
  const testProject: Book = {
    id: 'sample_project',
    title: 'サンプルプロジェクト',
    coverEmoji: '🚀',
    updatedAt: Date.now(),
    sourceCount: 3,
    archived: false,
    content: '<h1>サンプルプロジェクト</h1><p>バックエンドテスト用のプロジェクト</p>',
    files: [
      {
        id: 'chapter1',
        title: 'chapter1.txt',
        content: '第1章: 旅立ち\n\n太郎の冒険が始まります...',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000
      },
      {
        id: 'chapter2',
        title: 'chapter2.txt',
        content: '第2章: 出会い\n\n森で魔法使いに出会います...',
        createdAt: Date.now() - 43200000,
        updatedAt: Date.now() - 43200000
      },
      {
        id: 'chapter3',
        title: 'chapter3.txt',
        content: '第3章: 試練\n\n龍の洞窟への挑戦...',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ],
    activeFileId: 'chapter1'
  };

  return [...books, testProject];
};

const generateDummyMaterials = (): Record<string, Material[]> => {
  // バックエンドのsample_bookに対応する資料データ
  const sampleBookMaterials: Material[] = [
    {
      id: 'edo-period-life',
      title: 'edo_period_life.md',
      content: '江戸時代の暮らしについての資料内容...',
      createdAt: Date.now() - 172800000 // 2日前
    },
    {
      id: 'fantasy-worldbuilding',
      title: 'fantasy_worldbuilding.md',
      content: 'ファンタジー世界構築のヒント...',
      createdAt: Date.now() - 86400000 // 1日前
    },
    {
      id: 'japanese-legends',
      title: 'japanese_legends.md',
      content: '日本の伝説と民話について...',
      createdAt: Date.now() - 43200000 // 12時間前
    }
  ];

  return {
    sample_book: sampleBookMaterials
  };
};

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // UI State初期値
      ui: {
        leftTab: 'files',
        rightTab: 'dict',
        rightSubTab: 'upload',
        rightPanelOpen: false
      },
      setLeftTab: (tab) => set((state) => ({ ui: { ...state.ui, leftTab: tab } })),
      setRightTab: (tab) => set((state) => ({ ui: { ...state.ui, rightTab: tab } })),
      setRightSubTab: (tab) => set((state) => ({ ui: { ...state.ui, rightSubTab: tab } })),
      setRightPanelOpen: (open) => set((state) => ({ ui: { ...state.ui, rightPanelOpen: open } })),

      // Project Files
      addProjectFile: (bookId, file) => set((state) => ({
        books: state.books.map(book =>
          book.id === bookId
            ? {
              ...book,
              files: [...(book.files || []), file],
              activeFileId: book.activeFileId || file.id,
              updatedAt: Date.now()
            }
            : book
        )
      })),

      updateProjectFile: async (bookId, file) => {
        console.log('=== UPDATE PROJECT FILE ===');
        console.log('Book ID:', bookId);
        console.log('File:', file);
        
        // まずローカル状態を更新
        set((state) => ({
          books: state.books.map(book =>
            book.id === bookId
              ? {
                ...book,
                files: (book.files || []).map(f => f.id === file.id ? file : f),
                updatedAt: Date.now()
              }
              : book
          )
        }));

        // バックエンドAPIにも保存
        try {
          const state = get();
          await state.saveProjectFile(bookId, file.title, file.content);
          console.log('✅ File saved to backend successfully');
        } catch (error) {
          console.error('❌ Failed to save file to backend:', error);
        }
      },

      renameProjectFile: async (bookId, fileId, oldTitle, newTitle) => {
        console.log('=== RENAME PROJECT FILE START ===');
        console.log('Book ID:', bookId);
        console.log('File ID:', fileId);
        console.log('Old title:', oldTitle);
        console.log('New title:', newTitle);
        
        // バリデーション
        if (!bookId || !fileId || !oldTitle || !newTitle) {
          console.error('Missing required parameters for rename');
          throw new Error('Missing required parameters for file rename');
        }
        
        if (oldTitle === newTitle) {
          console.log('Old and new titles are the same, skipping rename');
          return;
        }
        
        console.log('Starting backend API call first...');

        // バックエンドでファイル名変更
        try {
          const url = `http://localhost:8000/api/projects/${bookId}/files/${encodeURIComponent(oldTitle)}/rename/${encodeURIComponent(newTitle)}`;
          console.log('Rename API URL:', url);
          console.log('Making PUT request to backend...');

          const response = await fetch(url, {
            method: 'PUT'
          });

          console.log('Rename response received');
          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Rename API Error response:', errorText);
            throw new Error(`Rename API Error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('Rename API Success response:', data);
          console.log('✅ File renamed in backend successfully');
          
          // バックエンド成功後にローカル状態を更新
          console.log('Updating local state after successful API call...');
          console.log('Current books state before update:', get().books);
          console.log('Looking for book with ID:', bookId);
          console.log('Looking for file with ID:', fileId);
          
          set((state) => {
            console.log('Inside set function - current state.books:', state.books);
            const updatedBooks = state.books.map(book => {
              console.log('Processing book:', book.id, book.id === bookId ? '(MATCH)' : '(NO MATCH)');
              if (book.id === bookId) {
                const updatedFiles = (book.files || []).map(f => {
                  console.log('Processing file:', f.id, f.title, f.id === fileId ? '(MATCH - UPDATING)' : '(NO MATCH)');
                  if (f.id === fileId) {
                    const updatedFile = { ...f, title: newTitle, updatedAt: Date.now() };
                    console.log('Updated file:', updatedFile);
                    return updatedFile;
                  }
                  return f;
                });
                
                const updatedBook = {
                  ...book,
                  files: updatedFiles,
                  updatedAt: Date.now()
                };
                console.log('Updated book files:', updatedFiles);
                return updatedBook;
              }
              return book;
            });
            
            console.log('Final updated books:', updatedBooks);
            return { books: updatedBooks };
          });
          
          console.log('Local state updated successfully');
          console.log('New books state after update:', get().books);
          console.log('=== RENAME PROJECT FILE COMPLETE ===');
        } catch (error) {
          console.error('❌ Failed to rename file in backend:', error);
          throw error;
        }
      },

      deleteProjectFile: async (bookId, fileId) => {
        console.log('=== DELETE PROJECT FILE ===');
        console.log('Book ID:', bookId);
        console.log('File ID:', fileId);
        
        // 削除するファイルを取得
        const state = get();
        const book = state.books.find(b => b.id === bookId);
        const file = book?.files?.find(f => f.id === fileId);
        
        if (!file) {
          console.error('❌ File not found in local state');
          return;
        }

        // ローカル状態から削除
        set((state) => ({
          books: state.books.map(book =>
            book.id === bookId
              ? {
                ...book,
                files: (book.files || []).filter(f => f.id !== fileId),
                activeFileId: book.activeFileId === fileId
                  ? (book.files || []).find(f => f.id !== fileId)?.id || null
                  : book.activeFileId,
                updatedAt: Date.now()
              }
              : book
          )
        }));

        // バックエンドからも削除
        try {
          const url = `http://localhost:8000/api/projects/${bookId}/files/${encodeURIComponent(file.title)}`;
          console.log('Delete API URL:', url);

          const response = await fetch(url, {
            method: 'DELETE'
          });

          console.log('Delete response status:', response.status);
          console.log('Delete response ok:', response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Delete API Error response:', errorText);
            throw new Error(`Delete API Error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('Delete API Success response:', data);
          console.log('✅ File deleted from backend successfully');
        } catch (error) {
          console.error('❌ Failed to delete file from backend:', error);
        }
      },

      setActiveFile: (bookId, fileId) => set((state) => ({
        books: state.books.map(book =>
          book.id === bookId
            ? { ...book, activeFileId: fileId, updatedAt: Date.now() }
            : book
        )
      })),

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

      createBook: async (title: string, coverEmoji?: string) => {
        try {
          // バックエンドAPIを呼び出してプロジェクトを作成
          const formData = new FormData();
          formData.append('title', title);

          // IDを生成（フロントエンド側で生成して統一）
          const bookId = `book-${Date.now()}`;
          formData.append('id', bookId);

          const response = await fetch('http://localhost:8000/api/projects', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }

          const data = await response.json();

          // 新しいBookオブジェクトを作成
          const newBook: Book = {
            id: bookId,
            title: title,
            coverEmoji: coverEmoji || '📚',
            updatedAt: Date.now(),
            sourceCount: 0,
            archived: false,
            content: '',
            files: [],
            activeFileId: null
          };

          // ローカル状態に追加
          set((state) => ({ books: [...state.books, newBook] }));

          return newBook;
        } catch (error) {
          console.error('Error creating book:', error);
          // エラー時はローカルのみで作成（フォールバック）
          const fallbackBook: Book = {
            id: `book-${Date.now()}`,
            title: title,
            coverEmoji: coverEmoji || '📚',
            updatedAt: Date.now(),
            sourceCount: 0,
            archived: false,
            content: '',
            files: [],
            activeFileId: null
          };

          set((state) => ({ books: [...state.books, fallbackBook] }));
          return fallbackBook;
        }
      },

      loadBooksFromBackend: async () => {
        console.log('=== LOAD BOOKS FROM BACKEND ===');
        try {
          // プロジェクト一覧を取得
          const response = await fetch('http://localhost:8000/api/projects', {
            method: 'GET'
          });

          if (!response.ok) {
            console.error('Failed to load projects from backend:', response.status);
            return;
          }

          const data = await response.json();
          console.log('Projects from backend:', data);

          const projects = data.projects || [];
          const books: Book[] = [];

          // 各プロジェクトの詳細を取得
          for (const project of projects) {
            try {
              const detailResponse = await fetch(`http://localhost:8000/api/projects/${project.id}`, {
                method: 'GET'
              });

              if (detailResponse.ok) {
                const detail = await detailResponse.json();
                const book: Book = {
                  id: detail.id,
                  title: detail.title,
                  coverEmoji: detail.coverEmoji || '📚',
                  updatedAt: new Date(detail.updatedAt || detail.created_at).getTime(),
                  sourceCount: detail.sourceCount || 0,
                  archived: detail.archived || false,
                  content: '',
                  files: detail.files || [],
                  activeFileId: detail.activeFileId
                };
                books.push(book);
              }
            } catch (error) {
              console.error(`Failed to load project detail for ${project.id}:`, error);
            }
          }

          console.log('Loaded books from backend:', books);
          set({ books });
        } catch (error) {
          console.error('Error loading books from backend:', error);
        }
      },

      refreshBookFromBackend: async (bookId: string) => {
        console.log('=== REFRESH BOOK FROM BACKEND ===');
        console.log('Book ID:', bookId);
        try {
          const response = await fetch(`http://localhost:8000/api/projects/${bookId}`, {
            method: 'GET'
          });

          if (!response.ok) {
            console.error('Failed to refresh book from backend:', response.status);
            return;
          }

          const detail = await response.json();
          const updatedBook: Book = {
            id: detail.id,
            title: detail.title,
            coverEmoji: detail.coverEmoji || '📚',
            updatedAt: new Date(detail.updatedAt || detail.created_at).getTime(),
            sourceCount: detail.sourceCount || 0,
            archived: detail.archived || false,
            content: '',
            files: detail.files || [],
            activeFileId: detail.activeFileId
          };

          console.log('Refreshed book:', updatedBook);

          set((state) => ({
            books: state.books.map(book =>
              book.id === bookId ? updatedBook : book
            )
          }));
        } catch (error) {
          console.error('Error refreshing book from backend:', error);
        }
      },

      saveProjectFile: async (projectId: string, filename: string, content: string) => {
        console.log('=== SAVE PROJECT FILE ===');
        console.log('Project ID:', projectId);
        console.log('Filename:', filename);
        console.log('Content length:', content.length);
        
        try {
          // バックエンドAPIを呼び出してファイルを保存
          const formData = new FormData();
          formData.append('content', content);

          const url = `http://localhost:8000/api/projects/${projectId}/files/${encodeURIComponent(filename)}`;
          console.log('API URL:', url);

          const response = await fetch(url, {
            method: 'PUT',
            body: formData
          });

          console.log('Response status:', response.status);
          console.log('Response ok:', response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error response:', errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('API Success response:', data);

          // ローカル状態のファイルも更新
          set((state) => ({
            books: state.books.map(book => {
              if (book.id === projectId) {
                const updatedFiles = book.files?.map(file =>
                  file.title === filename
                    ? { ...file, content, updatedAt: Date.now() }
                    : file
                ) || [];

                // ファイルが存在しない場合は新規作成
                if (!updatedFiles.some(file => file.title === filename)) {
                  updatedFiles.push({
                    id: `file-${Date.now()}`,
                    title: filename,
                    content,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  });
                  console.log('Added new file to local state:', filename);
                } else {
                  console.log('Updated existing file in local state:', filename);
                }

                return {
                  ...book,
                  files: updatedFiles,
                  updatedAt: Date.now()
                };
              }
              return book;
            })
          }));

          console.log('=== SAVE SUCCESS ===');
          return data;
        } catch (error) {
          console.error('=== SAVE ERROR ===');
          console.error('Error saving project file:', error);
          
          // エラー時はローカルのみで保存（フォールバック）
          set((state) => ({
            books: state.books.map(book => {
              if (book.id === projectId) {
                const updatedFiles = book.files?.map(file =>
                  file.title === filename
                    ? { ...file, content, updatedAt: Date.now() }
                    : file
                ) || [];

                if (!updatedFiles.some(file => file.title === filename)) {
                  updatedFiles.push({
                    id: `file-${Date.now()}`,
                    title: filename,
                    content,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                  });
                }

                return {
                  ...book,
                  files: updatedFiles,
                  updatedAt: Date.now()
                };
              }
              return book;
            })
          }));

          console.log('Saved to local state as fallback');
          throw error;
        }
      },

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
        // バックエンドからデータを読み込む（非同期だがここでは起動トリガー）
        const { loadBooksFromBackend } = get();
        loadBooksFromBackend().then(() => {
          console.log('Books loaded from backend successfully');
        }).catch(error => {
          console.error('Failed to load from backend, using fallback:', error);
          // バックエンドの読み込みに失敗した場合のフォールバック
          if (state.books.length === 0) {
            console.log('Initializing books with dummy data as fallback');
            set({
              books: generateDummyBooks(),
              materials: generateDummyMaterials()
            });
          }
        });

        // 既存のブックを新しいファイル構造に移行（レガシー対応）
        if (state.books.length > 0) {
          let needsMigration = false;
          const migratedBooks = state.books.map(book => {
            if (!book.files && book.content) {
              needsMigration = true;
              const mainFile: ProjectFile = {
                id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: `${book.title}.txt`,
                content: book.content.replace(/<[^>]*>/g, ''), // HTMLタグを除去してプレーンテキストに
                createdAt: book.updatedAt || Date.now(),
                updatedAt: book.updatedAt || Date.now()
              };

              return {
                ...book,
                files: [mainFile],
                activeFileId: mainFile.id
              };
            }
            return book;
          });

          if (needsMigration) {
            console.log('Migrated books to new file structure');
            return { books: migratedBooks };
          }
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