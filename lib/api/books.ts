import { Book } from '@/lib/store/types';
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

/**
 * 新しい書籍を作成
 * POST /api/books
 */
export async function createBookRequest(title: string, description?: string): Promise<Book> {
  const payload = {
    title,
    description: description || '',
    genre: '',
    status: 'draft'
  };

  return apiRequest<Book>('/books', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * 書籍を更新
 * PUT /api/books/:id
 */
export async function updateBookRequest(bookId: string, updates: Partial<Book>): Promise<Book> {
  return apiRequest<Book>(`/books/${bookId}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  });
}

/**
 * 書籍を削除
 * DELETE /api/books/:id
 */
export async function deleteBookRequest(bookId: string): Promise<void> {
  await apiRequest(`/books/${bookId}`, { method: 'DELETE' });
}
