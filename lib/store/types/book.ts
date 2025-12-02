import { Episode } from './episode';
import { Material } from './material';

/**
 * Book型 - バックエンドのBookモデルに対応
 * テーブル名は'novels'だが、モデル名はBook
 * フロントエンドとバックエンドで同じ構造を使用
 */
export type Book = {
  id: string;              // UUID (char(36))
  title: string;           // 書籍タイトル (max 255)
  description: string;     // 説明 (text)
  author_id: string;       // UUID (char(36)) - 将来の認証機能用
  cover_image?: string;    // カバー画像URL (max 500)
  genre: string;           // ジャンル (max 100)
  status: string;          // ステータス: 'draft' | 'published' | 'completed'
  episodes?: Episode[];    // 関連エピソード (Preloadで取得時のみ)
  materials?: Material[];  // 関連資料 (Preloadで取得時のみ)
  created_at: string;      // 作成日時 (ISO 8601)
  updated_at: string;      // 更新日時 (ISO 8601)
};
