import { Material } from '@/lib/store/types';
import { apiRequest } from './client';

export async function fetchMaterials(bookId: string): Promise<Material[]> {
  return apiRequest<Material[]>(`/books/${bookId}/materials`);
}
