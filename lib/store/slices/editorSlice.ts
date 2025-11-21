import { StoreSlice, EditorSlice } from './types';

export const createEditorSlice: StoreSlice<EditorSlice> = (set) => ({
  currentBookId: null,
  setCurrentBookId: (bookId) => set({ currentBookId: bookId }),
  saveBook: (bookId, title, content) => set((state) => ({
    books: state.books.map((book) =>
      book.id === bookId
        ? { ...book, title, content, updatedAt: Date.now() }
        : book
    )
  }))
});
