import { createBookRequest, deleteBookRequest, fetchBookDetail, fetchBooksWithDetails, updateBookRequest } from '@/lib/api/books';
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
      throw error;
    }
  },

  loadBooksFromBackend: async () => {
    try {
      const books = await fetchBooksWithDetails();
      set({ books });
    } catch (error) {
      console.error('Error loading books from backend:', error);
      throw error;
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
      throw error;
    }
  },

  updateBook: async (bookId, updates) => {
    try {
      const updatedBook = await updateBookRequest(bookId, updates);
      set((state) => ({
        books: state.books.map((b) => (b.id === bookId ? updatedBook : b))
      }));
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  deleteBook: async (bookId) => {
    try {
      await deleteBookRequest(bookId);
      set((state) => ({ books: state.books.filter((book) => book.id !== bookId) }));
    } catch (error) {
      console.error('Failed to delete book from backend:', error);
      throw error;
    }
  },

  initializeBooks: () => {
    const { loadBooksFromBackend } = get();
    loadBooksFromBackend()
      .then(() => {
        console.log('Books loaded from backend successfully');
      })
      .catch((error) => {
        console.error('Failed to load from backend:', error);
      });
  }
});
