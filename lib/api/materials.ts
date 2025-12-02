import { Material } from '@/lib/store/types';
import { apiRequest } from './client';

/**
 * 書籍に紐づく全資料を取得
 * GET /api/books/:bookId/materials
 */
export async function fetchMaterials(bookId: string): Promise<Material[]> {
  return apiRequest<Material[]>(`/books/${bookId}/materials`);
}

/**
 * 資料を作成（テキストコンテンツ）
 * POST /api/books/:bookId/materials
 */
export async function createMaterial(
  bookId: string,
  title: string,
  content: string
): Promise<Material> {
  return apiRequest<Material>(`/books/${bookId}/materials`, {
    method: 'POST',
    body: JSON.stringify({ title, content })
  });
}

