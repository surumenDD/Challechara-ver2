// 各モデルの型定義を個別ファイルからエクスポート
export type { Episode } from './types/episode';
export type { Material } from './types/material';
export type { Book } from './types/book';

// その他の型定義
export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
};

export type UIState = {
  leftTab: 'files' | 'chat';
  rightTab: 'dict' | 'material';
  rightSubTab: 'upload' | 'chat';
  rightPanelOpen: boolean;
};
