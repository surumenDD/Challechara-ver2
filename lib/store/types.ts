export type ProjectFile = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
};

export type Episode = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

export type Material = {
  id: string;
  title: string;
  content: string;
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
};

export type Book = {
  id: string;
  title: string;
  coverEmoji?: string;
  updatedAt: number;
  sourceCount: number;
  archived?: boolean;
  content?: string;
  files?: ProjectFile[];
  activeFileId?: string | null;
};

export type UIState = {
  leftTab: 'files' | 'chat';
  rightTab: 'dict' | 'material';
  rightSubTab: 'upload' | 'chat';
  rightPanelOpen: boolean;
};
