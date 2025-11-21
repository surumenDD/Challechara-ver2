import { Book, ProjectFile } from '@/lib/store/types';
import { apiRequest } from './client';

type BackendEpisode = {
  id: number | string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

type BackendBookDetail = {
  id: number | string;
  title: string;
  coverEmoji?: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  episodes?: BackendEpisode[];
};

type BackendBookListResponse = BackendBookDetail[] | { books: BackendBookDetail[] };

const toTimestamp = (value?: string) => (value ? new Date(value).getTime() : Date.now());

export const mapEpisodeToProjectFile = (episode: BackendEpisode): ProjectFile => ({
  id: String(episode.id),
  title: episode.title,
  content: episode.content,
  createdAt: toTimestamp(episode.created_at),
  updatedAt: toTimestamp(episode.updated_at)
});

const mapBookDetailToBook = (detail: BackendBookDetail): Book => {
  const files = (detail.episodes || []).map(mapEpisodeToProjectFile);
  return {
    id: String(detail.id),
    title: detail.title,
    coverEmoji: detail.coverEmoji || '📚',
    updatedAt: toTimestamp(detail.updated_at || detail.created_at),
    sourceCount: files.length,
    archived: detail.archived || false,
    content: '',
    files,
    activeFileId: files.length > 0 ? files[0].id : null
  };
};

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

export async function saveEpisodeRequest(projectId: string, fileId: string, filename: string, content: string): Promise<ProjectFile> {
  const isNewFile = fileId.startsWith('file-');
  const path = isNewFile ? `/books/${projectId}/episodes` : `/episodes/${fileId}`;
  const method = isNewFile ? 'POST' : 'PUT';
  const body = isNewFile
    ? { title: filename, content, episode_no: Date.now() }
    : { title: filename, content };

  const data = await apiRequest<BackendEpisode>(path, {
    method,
    body: JSON.stringify(body)
  });

  return mapEpisodeToProjectFile(data);
}

export async function renameEpisodeRequest(fileId: string, title: string, content: string): Promise<ProjectFile> {
  const data = await apiRequest<BackendEpisode>(`/episodes/${fileId}`, {
    method: 'PUT',
    body: JSON.stringify({ title, content })
  });
  return mapEpisodeToProjectFile(data);
}

export async function deleteEpisodeRequest(fileId: string): Promise<void> {
  await apiRequest(`/episodes/${fileId}`, { method: 'DELETE' });
}
