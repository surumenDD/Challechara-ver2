/**
 * Material型 - バックエンドのMaterialモデルに対応
 * 各参考資料は独立して存在し、book_idで書籍に紐づく
 * フロントエンドとバックエンドで同じ構造を使用
 */
export type Material = {
  id: string;              // UUID (char(36))
  book_id: string;         // UUID (char(36)) - 所属する書籍のID
  title: string;           // 資料タイトル
  content: string;         // 資料内容
  created_at: string;      // 作成日時 (ISO 8601)
  updated_at: string;      // 更新日時 (ISO 8601)
};
