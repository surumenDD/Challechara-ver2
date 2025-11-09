import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMaterialFromFile as addMaterialFromFileAPI } from '@/hooks/add-materials';

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
  addMaterialFromFile: (bookId: string, file: File) => Promise<void>;
  loadMaterialsFromBackend: (bookId: string) => Promise<void>;
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
  saveProjectFile: (projectId: string, fileId: string, filename: string, content: string) => Promise<any>;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => Promise<void>;
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
          await state.saveProjectFile(bookId, file.id, file.title, file.content);
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

        // バックエンドでファイル名変更（エピソードAPIを使用）
        try {
          // fileIdが"file-"で始まる場合は一時的なIDなのでバックエンド更新をスキップ
          if (!fileId.startsWith('file-')) {
            // エピソードの情報を取得
            const state = get();
            const book = state.books.find(b => b.id === bookId);
            const file = book?.files?.find(f => f.id === fileId);

            if (!file) {
              throw new Error('File not found in local state');
            }

            const url = `http://localhost:8080/api/episodes/${fileId}`;
            console.log('Rename API URL:', url);
            console.log('Making PUT request to backend...');

            const response = await fetch(url, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                title: newTitle,
                content: file.content
              })
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
          } else {
            console.log('⚠️ Temporary file ID detected, skipping backend rename');
          }

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

        // バックエンドからも削除（エピソードAPIを使用）
        try {
          // fileIdが"file-"で始まる場合は一時的なIDなのでバックエンド削除をスキップ
          if (!fileId.startsWith('file-')) {
            const url = `http://localhost:8080/api/episodes/${fileId}`;
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
          } else {
            console.log('⚠️ Temporary file ID detected, skipping backend deletion');
          }
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

      addMaterialFromFile: async (bookId: string, file: File) => {
        try {
          // Bookオブジェクトを取得して、実際のIDを確認
          const state = get();
          const book = state.books.find(b => b.id === bookId);

          if (!book) {
            throw new Error(`Book not found: ${bookId}`);
          }

          // Book IDが数値文字列の場合はそのまま使用
          // "book-"で始まる場合は、バックエンドからBook情報を取得して数値IDを取得
          let backendBookId: string;
          if (book.id.startsWith('book-')) {
            // バックエンドからBook情報を取得
            try {
              const response = await fetch(`http://localhost:8080/api/books`, {
                method: 'GET'
              });
              if (!response.ok) {
                throw new Error('Failed to fetch books');
              }
              const books = await response.json();
              // タイトルでマッチング
              const matchedBook = books.find((b: any) => b.title === book.title);
              if (matchedBook) {
                backendBookId = String(matchedBook.id);
              } else {
                // マッチしない場合は、bookIdから数値部分を抽出（フォールバック）
                backendBookId = book.id.replace('book-', '');
              }
            } catch (error) {
              console.warn('Failed to fetch books from backend, using fallback:', error);
              // フォールバック: bookIdから数値部分を抽出
              backendBookId = book.id.replace('book-', '');
            }
          } else {
            // 既に数値文字列の場合はそのまま使用
            backendBookId = book.id;
          }

          // バックエンドAPIに送信して資料を追加
          const material = await addMaterialFromFileAPI(file, backendBookId);

          // ローカル状態も更新
          set((state) => ({
            materials: {
              ...state.materials,
              [bookId]: [...(state.materials[bookId] || []), material]
            }
          }));
        } catch (error) {
          console.error('Error adding material from file:', error);
          throw error;
        }
      },

      loadMaterialsFromBackend: async (bookId: string) => {
        try {
          // Bookオブジェクトを取得して、実際のIDを確認
          const state = get();
          const book = state.books.find(b => b.id === bookId);

          if (!book) {
            console.warn(`Book not found: ${bookId}`);
            return;
          }

          // Book IDが数値文字列の場合はそのまま使用
          // "book-"で始まる場合は、バックエンドからBook情報を取得して数値IDを取得
          let backendBookId: string;
          if (book.id.startsWith('book-')) {
            // バックエンドからBook情報を取得
            try {
              const booksResponse = await fetch(`http://localhost:8080/api/books`, {
                method: 'GET'
              });
              if (!booksResponse.ok) {
                throw new Error('Failed to fetch books');
              }
              const books = await booksResponse.json();
              // タイトルでマッチング
              const matchedBook = books.find((b: any) => b.title === book.title);
              if (matchedBook) {
                backendBookId = String(matchedBook.id);
              } else {
                // マッチしない場合は、bookIdから数値部分を抽出（フォールバック）
                backendBookId = book.id.replace('book-', '');
              }
            } catch (error) {
              console.warn('Failed to fetch books from backend, using fallback:', error);
              // フォールバック: bookIdから数値部分を抽出
              backendBookId = book.id.replace('book-', '');
            }
          } else {
            // 既に数値文字列の場合はそのまま使用
            backendBookId = book.id;
          }

          // 正しいエンドポイント: /api/books/{id}/materials
          const response = await fetch(`http://localhost:8080/api/books/${backendBookId}/materials`, {
            method: 'GET'
          });

          if (!response.ok) {
            console.error('Failed to load materials from backend:', response.status);
            return;
          }

          const materials = await response.json();

          set((state) => ({
            materials: {
              ...state.materials,
              [bookId]: materials
            }
          }));

          console.log(`Materials loaded for book ${bookId}:`, materials.length);
        } catch (error) {
          console.error('Error loading materials from backend:', error);
        }
      },

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
          // バックエンドAPIを呼び出してBookを作成（JSON形式）
          const response = await fetch('http://localhost:8080/api/books', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: title,
              description: '',
              genre: '',
              status: 'draft'
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`API Error: ${response.status}`);
          }

          const data = await response.json();
          console.log('Created book from backend:', data);

          // バックエンドから返されたデータを使用してBookオブジェクトを作成
          const newBook: Book = {
            id: String(data.id), // バックエンドの数値IDを文字列に変換
            title: data.title,
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
          // Book一覧を取得
          const response = await fetch('http://localhost:8080/api/books', {
            method: 'GET'
          });

          if (!response.ok) {
            console.error('Failed to load books from backend:', response.status);
            return;
          }

          const data = await response.json();
          console.log('Books from backend:', data);

          const booksData = Array.isArray(data) ? data : (data.books || []);
          const books: Book[] = [];

          // 各Bookの詳細を取得
          for (const bookData of booksData) {
            try {
              const detailResponse = await fetch(`http://localhost:8080/api/books/${bookData.id}`, {
                method: 'GET'
              });

              if (detailResponse.ok) {
                const detail = await detailResponse.json();

                // バックエンドから取得したepisodesをfilesにマッピング
                const files = (detail.episodes || []).map((episode: any) => ({
                  id: String(episode.id),
                  title: episode.title,
                  content: episode.content,
                  createdAt: new Date(episode.created_at).getTime(),
                  updatedAt: new Date(episode.updated_at).getTime()
                }));

                const book: Book = {
                  id: String(detail.id),
                  title: detail.title,
                  coverEmoji: detail.coverEmoji || '📚',
                  updatedAt: new Date(detail.updated_at || detail.created_at).getTime(),
                  sourceCount: (detail.episodes || []).length,
                  archived: detail.archived || false,
                  content: '',
                  files: files,
                  activeFileId: files.length > 0 ? files[0].id : null
                };
                books.push(book);
              }
            } catch (error) {
              console.error(`Failed to load book detail for ${bookData.id}:`, error);
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
          const response = await fetch(`http://localhost:8080/api/books/${bookId}`, {
            method: 'GET'
          });

          if (!response.ok) {
            console.error('Failed to refresh book from backend:', response.status);
            return;
          }

          const detail = await response.json();

          // バックエンドから取得したepisodesをfilesにマッピング
          const files = (detail.episodes || []).map((episode: any) => ({
            id: String(episode.id),
            title: episode.title,
            content: episode.content,
            createdAt: new Date(episode.created_at).getTime(),
            updatedAt: new Date(episode.updated_at).getTime()
          }));

          const updatedBook: Book = {
            id: String(detail.id),
            title: detail.title,
            coverEmoji: detail.coverEmoji || '📚',
            updatedAt: new Date(detail.updated_at || detail.created_at).getTime(),
            sourceCount: (detail.episodes || []).length,
            archived: detail.archived || false,
            content: '',
            files: files,
            activeFileId: files.length > 0 ? files[0].id : null
          };

          console.log('Refreshed book:', updatedBook);
          console.log('Mapped files from episodes:', files);

          set((state) => ({
            books: state.books.map(book =>
              book.id === bookId ? updatedBook : book
            )
          }));
        } catch (error) {
          console.error('Error refreshing book from backend:', error);
        }
      },

      saveProjectFile: async (projectId: string, fileId: string, filename: string, content: string) => {
        console.log('=== SAVE PROJECT FILE ===');
        console.log('Project ID:', projectId);
        console.log('File ID:', fileId);
        console.log('Filename:', filename);
        console.log('Content length:', content.length);

        try {
          // fileIdから実際のエピソードIDを抽出
          // fileIdが数値の場合は既存エピソード、"file-"で始まる場合は新規作成
          const isNewFile = fileId.startsWith('file-');
          let url: string;
          let method: string;
          let body: string;

          if (isNewFile) {
            // 新規エピソードを作成
            url = `http://localhost:8080/api/books/${projectId}/episodes`;
            method = 'POST';
            body = JSON.stringify({
              title: filename,
              content: content,
              episode_no: Date.now() // タイムスタンプをエピソード番号として使用
            });
          } else {
            // 既存エピソードを更新
            url = `http://localhost:8080/api/episodes/${fileId}`;
            method = 'PUT';
            body = JSON.stringify({
              title: filename,
              content: content
            });
          }

          console.log('API URL:', url);
          console.log('Method:', method);

          const response = await fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: body
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

          // 新規作成の場合、バックエンドから返されたIDでファイルを更新
          if (isNewFile && data.id) {
            const newFile: ProjectFile = {
              id: String(data.id),
              title: data.title,
              content: data.content,
              createdAt: new Date(data.created_at).getTime(),
              updatedAt: new Date(data.updated_at).getTime()
            };

            set((state) => ({
              books: state.books.map(book => {
                if (book.id === projectId) {
                  // 一時IDのファイルを新しいファイルに置き換え
                  const updatedFiles = book.files?.map(file =>
                    file.id === fileId ? newFile : file
                  ) || [newFile];

                  return {
                    ...book,
                    files: updatedFiles,
                    activeFileId: String(data.id),
                    sourceCount: updatedFiles.length,
                    updatedAt: Date.now()
                  };
                }
                return book;
              })
            }));
            console.log('Updated file ID from', fileId, 'to', data.id);
            console.log('New file created:', newFile);
          } else {
            // 既存ファイルの更新の場合も状態を更新
            set((state) => ({
              books: state.books.map(book => {
                if (book.id === projectId) {
                  const updatedFiles = book.files?.map(file =>
                    file.id === fileId
                      ? { ...file, content, updatedAt: Date.now() }
                      : file
                  ) || [];

                  return {
                    ...book,
                    files: updatedFiles,
                    updatedAt: Date.now()
                  };
                }
                return book;
              })
            }));
            console.log('Updated existing file:', fileId);
          }

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

      deleteBook: async (bookId) => {
        console.log('=== DELETE BOOK ===');
        console.log('Book ID:', bookId);

        // まずローカル状態から削除
        set((state) => ({
          books: state.books.filter(b => b.id !== bookId)
        }));

        // バックエンドからも削除
        try {
          const url = `http://localhost:8080/api/books/${bookId}`;
          console.log('Delete book API URL:', url);

          const response = await fetch(url, {
            method: 'DELETE'
          });

          console.log('Delete book response status:', response.status);
          console.log('Delete book response ok:', response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Delete book API Error response:', errorText);
            throw new Error(`Delete book API Error: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('Delete book API Success response:', data);
          console.log('✅ Book deleted from backend successfully');
        } catch (error) {
          console.error('❌ Failed to delete book from backend:', error);
          // エラーの場合でもローカルでは削除済みなので続行
        }
      },

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