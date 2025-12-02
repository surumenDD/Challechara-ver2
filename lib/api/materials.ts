import { Material } from '@/lib/store/types';
import { apiRequest } from './client';

/**
 * 書籍に紐づく全資料を取得
 * GET /api/books/:bookId/materials
 */
export async function fetchMaterials(bookId: string): Promise<Material[]> {
  return apiRequest<Material[]>(`/books/${bookId}/materials`);
}
