# 📝 Challechara-ver2 - AI執筆支援システム

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

Gemini AIを活用したRAG機能搭載の執筆支援プラットフォーム

[機能](#-主要機能) • [セットアップ](#-セットアップ) • [使い方](#-使い方) • [技術スタック](#-技術スタック)

</div>

---

## 📖 概要

**Challechara-ver2**は、Gemini AIのRAG（Retrieval-Augmented Generation）機能を活用した執筆支援システムのフロントエンドです。執筆中のエピソードや参考資料を参照しながら、AIと対話的に物語を創造できます。

### 🎯 コンセプト

- **Book中心設計**: 作品をBookとして管理し、Episode（各話）とMaterial（資料）を紐付け
- **コンテキスト理解型AI**: 選択したEpisode/Materialの内容を理解して対話
- **3パネルレイアウト**: 編集・対話・資料管理を同時実行
- **リアルタイム同期**: バックエンドとの完全な状態同期

---

## ✨ 主要機能

### 📚 Book & Episode管理

- **Book作成・編集・削除**: 作品プロジェクトの管理
- **Episode作成・編集**: TipTapリッチテキストエディタで執筆
- **Episode削除**: 不要なエピソードの削除
- **エピソード番号管理**: episode_noによる順序管理
- **自動保存**: 編集内容のバックエンド同期

### 📂 Material（資料）管理

- **ファイルアップロード**: 参考資料のアップロード（複数ファイル対応）
- **Material一覧**: Book毎の資料管理
- **Material削除**: 不要な資料の削除
- **自動同期**: バックエンドとの状態同期

### 💬 3種類のAIチャット機能

#### 1. ソースチャット（Episode参照型）
```typescript
// 左パネルで選択したEpisodeを参照
selectedEpisodeIds: string[]  // 複数Episode選択
chatType: 'project'           // プロジェクトチャット
```
- 選択した複数のEpisodeを参照
- ストーリーの流れを理解した回答
- 執筆内容に基づいたアドバイス

#### 2. Materialチャット（資料参照型）
```typescript
// 右パネルで選択したMaterialを参照
selectedMaterialIds: string[] // 複数Material選択
chatType: 'material'          // 資料チャット
```
- アップロードした資料を分析
- 資料に基づいた詳細な提案
- 複数資料の横断的参照

#### 3. 辞書チャット
```typescript
chatType: 'dictionary'        // 辞書チャット
```
- 語彙・表現のブレインストーミング
- 類語・言い換え提案
- 文章改善案の生成

### 🎨 UI/UX機能

- **3パネルレイアウト**
  - 左: Episode一覧・ソースチャット
  - 中央: TipTapエディタ
  - 右: Material管理・辞書チャット
- **リサイズ可能パネル**: `react-resizable-panels`使用
- **タブUI**: 左（files/chat）・右（dict/material - upload/chat）
- **ダークモード対応準備**: `next-themes`導入済み（Tailwind CSS設定完了、ThemeProviderは未実装）
- **トースト通知**: Sonner統合
- **アクセシブルUI**: Radix UIコンポーネント群

---

## 🚀 セットアップ

### 前提条件

- **Node.js**: 18.x 以上
- **npm** または **yarn**
- **バックエンドサーバー**:
  - **Go（Challecara2025）**: `http://localhost:8080/api`
  - **Python FastAPI（チャット）**: `http://localhost:8000/api`

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/surumenDD/Challechara-ver2.git
cd Challechara-ver2

# 依存関係のインストール
npm install
```

### 環境変数設定

`.env.local` ファイルを作成：

```bash
# バックエンドAPIのベースURL（Go）
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

チャットAPIのURLは `lib/chatProvider.ts` でハードコード：
```typescript
constructor(baseURL: string = 'http://localhost:8000/api')
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

---

## 📂 プロジェクト構造

```
Challechara-ver2/
├── app/                          # Next.js 14 App Router
│   ├── (home)/                  # ホームページルートグループ
│   │   └── page.tsx            # Book一覧画面
│   ├── book/                    # Bookルート
│   │   └── [id]/               # 動的ルート
│   │       └── page.tsx        # Book詳細・Episode編集画面
│   ├── layout.tsx               # ルートレイアウト
│   └── globals.css              # グローバルスタイル
│
├── components/                   # Reactコンポーネント
│   ├── Common/                  # 共通コンポーネント
│   │   ├── ChipList.tsx        # 選択済みアイテム表示
│   │   └── EmptyState.tsx      # 空状態プレースホルダー
│   ├── Editor/                  # エディタ関連
│   │   ├── RichEditor.tsx      # TipTap エディタ本体
│   │   └── TitleBar.tsx        # エディタヘッダー（保存・削除）
│   ├── Left/                    # 左パネル
│   │   ├── FileManager.tsx     # Episode ファイル一覧
│   │   ├── SourceManager.tsx   # Episode 選択管理
│   │   ├── SourceItem.tsx      # Episode アイテムUI
│   │   └── SourceChat.tsx      # ソースチャットUI
│   ├── Right/                   # 右パネル
│   │   ├── MaterialUpload.tsx  # Material アップロードUI
│   │   ├── MaterialChat.tsx    # Material チャットUI
│   │   └── DictionarySearch.tsx # 辞書チャットUI
│   ├── Chat/                    # チャット共通
│   │   ├── ChatWindow.tsx      # チャット履歴表示
│   │   └── Composer.tsx        # メッセージ入力欄
│   ├── home/                    # ホーム画面
│   │   ├── BookGrid.tsx        # Book グリッド表示
│   │   ├── BookList.tsx        # Book リスト表示
│   │   ├── BookCard.tsx        # Book カード
│   │   ├── NewBookCard.tsx     # 新規作成カード
│   │   └── Toolbar.tsx         # ソート・検索・表示切替
│   ├── Panels.tsx               # パネルレイアウト
│   ├── Header.tsx               # アプリヘッダー
│   └── ui/                      # shadcn/ui コンポーネント
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── tabs.tsx
│       └── ... (30+個のUIコンポーネント)
│
├── lib/                         # ビジネスロジック
│   ├── api/                     # API通信層
│   │   ├── client.ts           # APIクライアント基底
│   │   ├── books.ts            # Book API
│   │   ├── episodes.ts         # Episode API
│   │   └── materials.ts        # Material API
│   ├── store/                   # Zustand 状態管理
│   │   ├── slices/             # Store スライス
│   │   │   ├── bookSlice.ts   # Book・Episode・Material状態
│   │   │   ├── chatSlice.ts   # チャット履歴
│   │   │   ├── uiSlice.ts     # UI状態
│   │   │   └── types.ts       # スライス型定義
│   │   └── types/              # モデル型定義
│   │       ├── book.ts        # Book 型
│   │       ├── episode.ts     # Episode 型
│   │       └── material.ts    # Material 型
│   ├── store.ts                 # Zustand ストア設定（永続化）
│   ├── chatProvider.ts          # チャットプロバイダー（API・Mock）
│   ├── file.ts                  # ファイル処理ユーティリティ
│   └── utils.ts                 # 汎用ユーティリティ関数
│
├── hooks/                       # カスタムフック
│   ├── use-toast.ts            # トースト通知
│   └── add-materials.ts        # Material追加処理
│
├── tests/                       # E2Eテスト（Playwright）
│   ├── editor.spec.ts          # エディタテスト
│   └── home.spec.ts            # ホーム画面テスト
│
├── public/                      # 静的ファイル
├── components.json              # shadcn/ui 設定
├── next.config.js               # Next.js 設定
├── tailwind.config.ts           # Tailwind CSS 設定
├── tsconfig.json                # TypeScript 設定
├── playwright.config.ts         # Playwright 設定
└── package.json                 # 依存関係
```

---

## 🛠️ 技術スタック

### コアフレームワーク

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 14.2.5 | React フレームワーク（App Router） |
| React | 18.2.0 | UIライブラリ |
| TypeScript | 5.2.2 | 型安全性 |
| Tailwind CSS | 3.3.3 | ユーティリティファーストCSS |

### 状態管理

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Zustand | 5.0.8 | グローバル状態管理（永続化対応） |
| zustand/middleware | - | persist ミドルウェア（localStorage同期） |

### フォーム・バリデーション

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React Hook Form | 7.53.0 | フォーム状態管理 |
| Zod | 3.23.8 | スキーマバリデーション |
| @hookform/resolvers | 3.9.0 | Zodリゾルバ |

### UIコンポーネント

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Radix UI | 複数 | アクセシブルなプリミティブコンポーネント |
| - @radix-ui/react-dialog | 1.1.1 | モーダルダイアログ |
| - @radix-ui/react-tabs | 1.1.0 | タブUI |
| - @radix-ui/react-dropdown-menu | 2.1.1 | ドロップダウンメニュー |
| - @radix-ui/react-scroll-area | 1.1.0 | スクロールエリア |
| - @radix-ui/react-tooltip | 1.1.2 | ツールチップ |
| TipTap | 3.2.1 | リッチテキストエディタ |
| - @tiptap/react | 3.2.1 | React統合 |
| - @tiptap/starter-kit | 3.2.1 | 基本機能パック |
| Lucide React | 0.446.0 | アイコンライブラリ |
| Sonner | 1.5.0 | トースト通知 |

### レイアウト・アニメーション

| 技術 | バージョン | 用途 |
|------|-----------|------|
| react-resizable-panels | 2.1.9 | リサイズ可能な3パネルレイアウト |
| tailwindcss-animate | 1.0.7 | Tailwind CSSアニメーション拡張 |
| class-variance-authority | 0.7.0 | バリアント管理 |
| clsx | 2.1.1 | 条件付きクラス名 |
| tailwind-merge | 2.5.2 | Tailwindクラス統合 |

### その他

| 技術 | バージョン | 用途 |
|------|-----------|------|
| next-themes | 0.3.0 | ダークモード対応準備（Tailwind設定済み） |
| embla-carousel-react | 8.3.0 | カルーセル |
| date-fns | 3.6.0 | 日付処理 |
| react-day-picker | 8.10.1 | 日付ピッカー |

### 開発・テスト

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Playwright | 1.55.0 | E2Eテスト |
| ESLint | 8.49.0 | 静的解析 |
| eslint-config-next | 13.5.1 | Next.js用ESLint設定 |

---

## 📡 バックエンドAPI仕様

### Go バックエンド（Challecara2025）

**ベースURL**: `http://localhost:8080/api`

#### Books API
```http
GET    /books                    # Book一覧取得（Episodes/Materials含む）
GET    /books/:id                # Book詳細取得（Episodes/Materials含む）
POST   /books                    # Book作成
PUT    /books/:id                # Book更新
DELETE /books/:id                # Book削除
```

#### Episodes API
```http
POST   /books/:id/episodes       # Episode作成
GET    /books/:id/episodes       # Book配下のEpisode一覧取得
POST   /books/:id/episodes/batch # 複数Episode一括取得
GET    /episodes/:id             # Episode詳細取得
PUT    /episodes/:id             # Episode更新
DELETE /episodes/:id             # Episode削除
```

#### Materials API
```http
POST   /books/:id/materials      # Material作成（アップロード）
GET    /books/:id/materials      # Book配下のMaterial一覧取得
POST   /books/:id/materials/batch # 複数Material一括取得
GET    /materials/:id            # Material詳細取得
PUT    /materials/:id            # Material更新
DELETE /materials/:id            # Material削除
```

#### Health Check
```http
GET    /health                   # ヘルスチェック
```

### Python FastAPI（チャットバックエンド）

**ベースURL**: `http://localhost:8000/api`

#### Chat API
```http
POST   /chat/project             # プロジェクトチャット（Episode参照）
POST   /chat/material            # Materialチャット（資料参照）
POST   /chat/dictionary          # 辞書チャット
```

**リクエスト例**:
```typescript
{
  messages: ChatMessage[],  // チャット履歴
  sources: string[]         // 参照するEpisode/MaterialのID配列
}
```

**レスポンス例**:
```typescript
{
  message: {
    id: string,
    role: 'assistant',
    content: string,
    ts: number
  }
}
```

---

## 🏗️ データモデル

### Book型
```typescript
type Book = {
  id: string;              // UUID
  title: string;           // 書籍タイトル
  description: string;     // 説明
  author_id: string;       // 作者ID（将来の認証機能用）
  cover_image?: string;    // カバー画像URL
  genre: string;           // ジャンル
  status: string;          // 'draft' | 'published' | 'completed'
  episodes?: Episode[];    // 関連Episode（Preload時）
  materials?: Material[];  // 関連Material（Preload時）
  created_at: string;      // 作成日時（ISO 8601）
  updated_at: string;      // 更新日時（ISO 8601）
};
```

### Episode型
```typescript
type Episode = {
  id: string;              // UUID
  book_id: string;         // 所属するBookのID
  title: string;           // エピソードタイトル
  content: string;         // エピソード本文（longtext）
  episode_no: number;      // エピソード番号
  created_at: string;      // 作成日時（ISO 8601）
  updated_at: string;      // 更新日時（ISO 8601）
};
```

### Material型
```typescript
type Material = {
  id: string;              // UUID
  book_id: string;         // 所属するBookのID
  title: string;           // 資料タイトル
  content: string;         // 資料内容
  created_at: string;      // 作成日時（ISO 8601）
  updated_at: string;      // 更新日時（ISO 8601）
};
```

### ChatMessage型
```typescript
type ChatMessage = {
  id: string;              // メッセージID
  role: 'user' | 'assistant';
  content: string;         // メッセージ内容
  ts: number;              // タイムスタンプ
};
```

---

## 🗂️ Zustand状態管理

### AppStore型定義

```typescript
type AppStore = {
  // ========== UI状態 ==========
  ui: {
    leftTab: 'files' | 'chat';              // 左パネルのタブ
    rightTab: 'dict' | 'material';          // 右パネルのタブ
    rightSubTab: 'upload' | 'chat';         // 右パネルのサブタブ
    rightPanelOpen: boolean;                // 右パネル開閉状態
  };
  setLeftTab: (tab: 'files' | 'chat') => void;
  setRightTab: (tab: 'dict' | 'material') => void;
  setRightSubTab: (tab: 'upload' | 'chat') => void;
  setRightPanelOpen: (open: boolean) => void;

  // ========== Book・Episode・Material管理 ==========
  books: Book[];                             // 全Book一覧
  activeEpisodeId: string | null;            // 現在編集中のEpisode
  selectedEpisodeIds: string[];              // ソースチャットで選択中のEpisode
  selectedMaterialIds: string[];             // Materialチャットで選択中のMaterial
  sortOrder: 'newest' | 'oldest' | 'a-z';    // Book一覧のソート順
  viewMode: 'grid' | 'list';                 // Book一覧の表示モード
  query: string;                             // 検索クエリ

  // Book操作
  loadBooksFromBackend: () => Promise<void>;
  refreshBookFromBackend: (bookId: string) => Promise<void>;
  createBook: (title: string, description?: string) => Promise<Book>;
  updateBook: (bookId: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;

  // Episode・Material選択
  setActiveEpisodeId: (episodeId: string | null) => void;
  setSelectedEpisodeIds: (ids: string[]) => void;
  setSelectedMaterialIds: (ids: string[]) => void;

  // 表示設定
  setSortOrder: (order: 'newest' | 'oldest' | 'a-z') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setQuery: (query: string) => void;

  // ========== チャット履歴（Book毎に保存） ==========
  sourceChats: Record<string, ChatMessage[]>;     // プロジェクトチャット履歴
  materialChats: Record<string, ChatMessage[]>;   // Materialチャット履歴
  dictChats: Record<string, ChatMessage[]>;       // 辞書チャット履歴

  addSourceChatMessage: (bookId: string, message: ChatMessage) => void;
  addMaterialChatMessage: (bookId: string, message: ChatMessage) => void;
  addDictChatMessage: (bookId: string, message: ChatMessage) => void;
};
```

### 永続化設定

```typescript
// localStorageに保存される状態
const partialize = (state: AppStore) => ({
  books: state.books,
  activeEpisodeId: state.activeEpisodeId,
  selectedEpisodeIds: state.selectedEpisodeIds,
  selectedMaterialIds: state.selectedMaterialIds,
  sourceChats: state.sourceChats,
  materialChats: state.materialChats,
  dictChats: state.dictChats,
  sortOrder: state.sortOrder,
  viewMode: state.viewMode,
  query: state.query,
  ui: state.ui
});
```

---

## 🎯 使い方

### 1. Book作成

1. ホーム画面（`http://localhost:3000`）にアクセス
2. 「新しいブックを作成」カードをクリック
3. Book名・説明を入力して作成

### 2. Episode作成・編集

1. Bookカードをクリックして詳細画面へ遷移（`/book/[id]`）
2. 左パネルの「新規ファイル」ボタンでEpisode作成
3. Episode名を入力
4. 中央のTipTapエディタで執筆
5. 「保存」ボタンで保存（自動保存も可能）

### 3. Material（資料）アップロード

1. Book詳細画面の右パネル
2. 「material」タブを開く
3. 「upload」サブタブで「ファイルを選択」またはドラッグ&ドロップ
4. アップロード完了後、一覧に表示

### 4. AI対話

#### A. ソースチャット（Episode参照）

1. 左パネル「files」タブでEpisodeを選択（複数可）
2. 「chat」タブに切り替え
3. チャット入力欄にメッセージを入力
4. AIが選択したEpisodeを参照して回答

#### B. Materialチャット（資料参照）

1. 右パネル「material」タブでMaterialを選択（複数可）
2. 「chat」サブタブに切り替え
3. メッセージを入力
4. AIが選択した資料を参照して分析・提案

#### C. 辞書チャット

1. 右パネル「dict」タブを開く
2. 語彙や表現について質問
3. AIが類語・表現案を提案

---

## 🔧 開発コマンド

### 開発サーバー

```bash
npm run dev
# http://localhost:3000 で起動
```

### プロダクションビルド

```bash
npm run build
npm start
```

### 型チェック

```bash
npm run type-check
```

### リント

```bash
npm run lint
```

### E2Eテスト（Playwright）

```bash
# テスト実行
npx playwright test

# UIモード
npx playwright test --ui

# 特定のテスト
npx playwright test tests/editor.spec.ts
```

---

## 🐛 トラブルシューティング

### ビルドエラー

```bash
# キャッシュクリア
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

### APIエラー

**バックエンド確認**:
```bash
# Go バックエンド
curl http://localhost:8080/api/health

# Python チャットバックエンド
curl http://localhost:8000/api/health
```

**環境変数確認**:
```bash
cat .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**CORS設定確認**: バックエンド側でフロントエンドのオリジン（`http://localhost:3000`）を許可しているか確認

### チャットが動かない

1. Python FastAPIサーバーが起動しているか確認
2. `lib/chatProvider.ts` の `baseURL` を確認
3. ブラウザのコンソールでネットワークエラーを確認

### スタイルが反映されない

```bash
npm run build
```

---

## 📝 コーディング規約

### ファイル命名

- コンポーネント: `PascalCase.tsx`
- ユーティリティ: `camelCase.ts`
- 型定義: `types.ts`

### インポート順序

```typescript
// 1. 外部ライブラリ
import React from 'react';
import { create } from 'zustand';

// 2. 内部モジュール（@/エイリアス）
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

// 3. 相対パス
import { BookCard } from './BookCard';
```

### コンポーネント設計

- 単一責任の原則に準拠
- プレゼンテーショナル/コンテナの分離
- カスタムフックで複雑なロジックを抽出

---

## 🤝 コントリビューション

プルリクエスト大歓迎です！

1. フォーク
2. フィーチャーブランチ作成（`git checkout -b feature/amazing-feature`）
3. コミット（`git commit -m 'Add amazing feature'`）
4. プッシュ（`git push origin feature/amazing-feature`）
5. プルリクエスト作成

### コミットメッセージ規約

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル修正
refactor: リファクタリング
test: テスト追加・修正
chore: ビルド・ツール変更
```

---

## 📄 ライセンス

MIT License

---

## 🔗 関連リンク

- **バックエンド（Go）**: [Challecara2025](https://github.com/Kan-O435/Challecara2025)
- **チャットバックエンド（Python）**: [Challechara-llmchat-backend](https://github.com/surumenDD/Challechara-llmchat-backend)
- **Issue報告**: [Issues](https://github.com/surumenDD/Challechara-ver2/issues)

---

## 👥 開発チーム

- **フロントエンド**: [surumenDD](https://github.com/surumenDD)
- **バックエンド**: [Kan-O435](https://github.com/Kan-O435)

---

<div align="center">

**Challechara** - AIとともに、新しい物語を。

Made with ❤️ by the Challechara Team

</div>
