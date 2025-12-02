import { Book, ProjectFile } from '@/lib/store/types';
import { apiRequest } from './client';


export async function fetchBooksWithDetails(): Promise<Book[]> {
  const listResponse = await apiRequest<BackendBookListResponse>('/books');
  const entries = Array.isArray(listResponse) ? listResponse : listResponse.books || [];

  const details = await Promise.all(entries.map(async (entry) => {
    try {
      return await fetchBookDetail(String(entry.id));
    } catch (error) {
      console.error(`Failed to fetch detail for book ${entry.id}:`, error);
      return null;
    }
  }));

  return details.filter((book): book is Book => Boolean(book));
}

export async function fetchBookDetail(bookId: string): Promise<Book> {
  const detail = await apiRequest<BackendBookDetail>(`/books/${bookId}`);
  return mapBookDetailToBook(detail);
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
