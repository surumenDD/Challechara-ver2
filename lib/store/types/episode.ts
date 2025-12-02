/**
 * Episode型 - バックエンドのEpisodeモデルに対応
 * 各エピソードは独立して存在し、book_idで書籍に紐づく
 * フロントエンドとバックエンドで同じ構造を使用
 */
export type Episode = {
  id: string;              // UUID (char(36))
  book_id: string;         // UUID (char(36)) - 所属する書籍のID
  title: string;           // エピソードタイトル (max 255)
  content: string;         // エピソード本文 (longtext)
  episode_no: number;      // エピソード番号
  created_at: string;      // 作成日時 (ISO 8601)
  updated_at: string;      // 更新日時 (ISO 8601)
};
