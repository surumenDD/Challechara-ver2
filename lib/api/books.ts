import { Book, ProjectFile } from '@/lib/store/types';
import { apiRequest } from './client';



/**
 * すべての書籍を取得（Episodes, Materialsを含む）
 * GET /api/books
 */
export async function fetchBooksWithDetails(): Promise<Book[]> {
  return apiRequest<Book[]>('/books');
}

/**
 * 特定の書籍を取得（Episodes, Materialsを含む）
 * GET /api/books/:id
 */
export async function fetchBookDetail(bookId: string): Promise<Book> {
  return apiRequest<Book>(`/books/${bookId}`);
}

export async function createBookRequest(title: string, coverEmoji?: string): Promise<Book> {
  const payload = {
    title,
    description: '',
    genre: '',
    status: 'draft'
  };

  const data = await apiRequest<BackendBookDetail>('/books', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return {
    id: String(data.id),
    title: data.title,
    coverEmoji: coverEmoji || data.coverEmoji || '📚',
    updatedAt: Date.now(),
    sourceCount: 0,
    archived: data.archived || false,
    content: '',
    files: [],
    activeFileId: null
  };
}

export async function deleteBookRequest(bookId: string): Promise<void> {
  await apiRequest(`/books/${bookId}`, { method: 'DELETE' });
}
