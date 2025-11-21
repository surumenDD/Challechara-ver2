import { apiRequest } from '@/lib/api/client';
import { Book } from '../types';

type BackendBookSummary = { id: number | string; title: string };
type BackendBookListResponse = BackendBookSummary[] | { books: BackendBookSummary[] };

export const isTemporaryBookId = (bookId: string) => bookId.startsWith('book-');
export const isTemporaryFileId = (fileId: string) => fileId.startsWith('file-');

export async function resolveBackendBookId(bookId: string, books: Book[]): Promise<string | null> {
  const book = books.find((b) => b.id === bookId);
  if (!book) return null;

  if (!isTemporaryBookId(book.id)) {
    return book.id;
  }

  try {
    const response = await apiRequest<BackendBookListResponse>('/books');
    const entries = Array.isArray(response) ? response : response.books || [];
    const matched = entries.find((entry) => entry.title === book.title);
    return matched ? String(matched.id) : null;
  } catch (error) {
    console.error('Failed to resolve backend book id:', error);
    return null;
  }
}
