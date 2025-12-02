import { deleteBookRequest, deleteEpisodeRequest, fetchBookDetail, fetchBooksWithDetails, renameEpisodeRequest, saveEpisodeRequest, createBookRequest } from '@/lib/api/books';
import { Book, ProjectFile } from '../types';
import { generateDummyBooks, generateDummyMaterials } from '../utils/dummyData';
import { isTemporaryFileId } from '../utils/backend';
import { BookSlice, StoreSlice } from './types';

export const createBookSlice: StoreSlice<BookSlice> = (set, get) => ({
  books: [],
  activeEpisodeId: null,
  selectedEpisodeIds: [],
  selectedMaterialIds: [],
  sortOrder: 'newest',
  viewMode: 'grid',
  query: '',
  setSortOrder: (order) => set({ sortOrder: order }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setQuery: (query) => set({ query }),
  
  setActiveEpisodeId: (episodeId) => set({ activeEpisodeId: episodeId }),
  setSelectedEpisodeIds: (ids) => set({ selectedEpisodeIds: ids }),
  setSelectedMaterialIds: (ids) => set({ selectedMaterialIds: ids }),

  addBook: (book) => set((state) => ({ books: [...state.books, book] })),

  createBook: async (title, description) => {
    try {
      const newBook = await createBookRequest(title, description);
      set((state) => ({ books: [...state.books, newBook] }));
      return newBook;
    } catch (error) {
      console.error('Error creating book:', error);
      const fallbackBook: Book = {
        id: `book-${Date.now()}`,
        title,
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
    try {
      const books = await fetchBooksWithDetails();
      set({ books });
    } catch (error) {
      console.error('Error loading books from backend:', error);
    }
  },
  refreshBookFromBackend: async (bookId) => {
    try {
      const updatedBook = await fetchBookDetail(bookId);
      set((state) => ({
        books: state.books.map((book) => (book.id === bookId ? updatedBook : book))
      }));
    } catch (error) {
      console.error('Error refreshing book from backend:', error);
    }
  },
  saveProjectFile: async (projectId, fileId, filename, content) => {
    try {
      const savedFile = await saveEpisodeRequest(projectId, fileId, filename, content);
      set((state) => ({
        books: state.books.map((book) =>
          book.id === projectId
            ? {
              ...book,
              files: (book.files || []).map((file) => (file.id === fileId ? savedFile : file)),
              sourceCount: (book.files || []).length,
              activeFileId: savedFile.id,
              updatedAt: Date.now()
            }
            : book
        )
      }));
      return savedFile;
    } catch (error) {
      console.error('Failed to save project file:', error);
      throw error;
    }
  },
  updateBook: (book) => set((state) => ({
    books: state.books.map((b) => (b.id === book.id ? { ...book, updatedAt: Date.now() } : b))
  })),
  deleteBook: async (bookId) => {
    set((state) => ({ books: state.books.filter((book) => book.id !== bookId) }));
    try {
      await deleteBookRequest(bookId);
    } catch (error) {
      console.error('Failed to delete book from backend:', error);
    }
  },

  initializeBooks: () => {
    const { loadBooksFromBackend } = get();
    loadBooksFromBackend()
      .then(() => {
        console.log('Books loaded from backend successfully');
      })
      .catch((error) => {
        console.error('Failed to load from backend, using fallback:', error);
        set((state) => {
          if (state.books.length === 0) {
            return {
              books: generateDummyBooks(),
              materials: generateDummyMaterials()
            };
          }
          return state;
        });
      });

    set((state) => {
      let needsMigration = false;
      const migratedBooks = state.books.map((book) => {
        if (!book.files && book.content) {
          needsMigration = true;
          const plainText = book.content.replace(/<[^>]*>/g, '');
          const mainFile: ProjectFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            title: `${book.title}.txt`,
            content: plainText,
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

      return state;
    });
  }
});
