import { Episode } from '@/lib/store/types';
import { apiRequest } from './client';

/**
 * エピソード作成用のペイロード型
 * Episode型から必要なフィールドのみを抽出
 */
export type CreateEpisodePayload = Pick<Episode, 'title' | 'content' | 'episode_no'>;

/**
 * エピソード更新用のペイロード型
 * Episode型から更新可能なフィールドのみを部分的に抽出
 */
export type UpdateEpisodePayload = Partial<Pick<Episode, 'title' | 'content' | 'episode_no'>>;

/**
 * 特定の書籍のすべてのエピソードを取得
 * GET /api/books/:id/episodes
 */
export async function fetchEpisodes(bookId: string): Promise<Episode[]> {
  return await apiRequest<Episode[]>(`/books/${bookId}/episodes`);
}

/**
 * 特定のエピソードを取得
 * GET /api/episodes/:id
 */
export async function fetchEpisode(episodeId: string): Promise<Episode> {
  return await apiRequest<Episode>(`/episodes/${episodeId}`);
}

/**
 * 新しいエピソードを作成
 * POST /api/books/:id/episodes
 */
export async function createEpisode(
  bookId: string,
  payload: CreateEpisodePayload
): Promise<Episode> {
  return await apiRequest<Episode>(`/books/${bookId}/episodes`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

/**
 * エピソードを更新
 * PUT /api/episodes/:id
 */
export async function updateEpisode(
  episodeId: string,
  payload: UpdateEpisodePayload
): Promise<Episode> {
  return await apiRequest<Episode>(`/episodes/${episodeId}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

/**
 * エピソードを削除
 * DELETE /api/episodes/:id
 */
export async function deleteEpisode(episodeId: string): Promise<void> {
  await apiRequest(`/episodes/${episodeId}`, {
    method: 'DELETE'
  });
}
