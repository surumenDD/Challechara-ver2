'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Search, Plus, FileText, Download, Trash } from 'lucide-react';
import { useStore, ProjectFile, Book } from '@/lib/store';
import { extractText } from '@/lib/file';

interface FileManagerProps {
  bookId: string;
  book: Book;
}

export default function FileManager({ bookId, book }: FileManagerProps) {
  const {
    activeEpisodeId,
    setActiveEpisodeId,
    selectedEpisodeIds,
    setSelectedEpisodeIds,
    refreshBookFromBackend,
    setLeftTab
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [dragOver, setDragOver] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // 削除確認ダイアログの表示
  const [activeFile, setActiveFileState] = useState<ProjectFile | null>(null); // 削除対象ファイル

  const fileInputRef = useRef<HTMLInputElement>(null);

  const files = book.files ?? [];
  const activeFileId = book.activeFileId;

  // ファイルアップロード処理
  const handleFiles = useCallback(async (uploadFiles: FileList) => {
    // 既存のエピソード数を取得して連番を生成
    const maxEpisodeNo = episodes.length > 0 
      ? Math.max(...episodes.map(e => e.episode_no || 0))
      : 0;
    
    let episodeCounter = maxEpisodeNo + 1;
    
    for (const file of Array.from(uploadFiles)) {
      // テキストファイル、Markdownファイルをサポート
      const isTextFile = file.type.startsWith('text/') || 
                        file.name.endsWith('.txt') || 
                        file.name.endsWith('.md') || 
                        file.name.endsWith('.markdown');
      
      if (isTextFile) {
        try {
          const content = await extractText(file);
          const payload = {
            title: file.name.replace(/\.[^/.]+$/, ''),
            content,
            episode_no: episodeCounter++
          };
          await createEpisode(bookId, payload);
          await refreshBookFromBackend(bookId);
        } catch (error) {
          console.error('ファイル処理エラー:', error);
          alert(`ファイル「${file.name}」のアップロードに失敗しました。`);
        }
      } else {
        alert(`ファイル「${file.name}」は対応していません。テキストファイル (.txt, .md) をアップロードしてください。`);
      }
    }
  }, [bookId, episodes, refreshBookFromBackend]);

  // 新規エピソード作成
  const handleCreateNewFile = useCallback(async () => {
    if (!newFileName.trim()) return;
    
    const maxEpisodeNo = episodes.length > 0 
      ? Math.max(...episodes.map(e => e.episode_no || 0))
      : 0;
    
    const title = newFileName.trim().replace('.txt', '');
    const payload = {
      title,
      content: `# ${title}\n\n`,
      episode_no: maxEpisodeNo + 1
    };

    try {
      const createdEpisode = await createEpisode(bookId, payload);
      await refreshBookFromBackend(bookId);
      setActiveEpisodeId(createdEpisode.id);
      setShowNewFileDialog(false);
      setNewFileName('');
    } catch (err) {
      console.error('エピソード作成エラー:', err);
    }
  }, [newFileName, bookId, createEpisode, refreshBookFromBackend, setActiveEpisodeId]);

  const handleDeleteFile = async (episodeId: string) => {
    const targetEpisode = episodes.find((e: Episode) => e.id === episodeId);
    if (!targetEpisode) return;

    try {
      console.log("=== DELETE EPISODE ===");
      console.log("Deleting episode:", targetEpisode.title);

      await deleteEpisode(episodeId);
      await refreshBookFromBackend(bookId);

      // activeEpisodeIdの更新
      const remainingEpisodes = episodes.filter((e: Episode) => e.id !== episodeId);
      if (activeEpisodeId === episodeId) {
        setActiveEpisodeId(remainingEpisodes.length > 0 ? remainingEpisodes[0].id : null);
      }

      console.log("✅ Episode deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete episode:", error);
    }
  };

  // ドラッグ&ドロップ
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const uploadFiles = e.dataTransfer.files;
    if (uploadFiles.length > 0) {
      handleFiles(uploadFiles);
    }
  }, [handleFiles]);

  // ファイル選択
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (uploadFiles) {
      handleFiles(uploadFiles);
    }
  }, [handleFiles]);

  // フィルタリング・ソート
  const filteredAndSortedEpisodes = episodes
    .filter((episode: Episode) => 
      episode.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: Episode, b: Episode) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'oldest':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // エピソード選択処理
  const handleEpisodeClick = useCallback((episodeId: string) => {
    console.log('Clicking episode:', episodeId);
    console.log('Current activeEpisodeId:', activeEpisodeId);
    setActiveEpisodeId(episodeId);
  }, [setActiveEpisodeId, activeEpisodeId]);

  // チャット用ファイル選択
  const handleToggleSelect = useCallback((fileId: string) => {
    const newSelection = activeSourceIds.includes(fileId)
      ? activeSourceIds.filter(id => id !== fileId)
      : [...activeSourceIds, fileId];
    setActiveSourceIds(newSelection);
  }, [activeSourceIds, setActiveSourceIds]);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredAndSortedFiles.map(f => f.id);
    setActiveSourceIds(allIds);
  }, [filteredAndSortedFiles, setActiveSourceIds]);

  const handleSelectNone = useCallback(() => {
    setActiveSourceIds([]);
  }, [setActiveSourceIds]);

  // チャット実行
  const handleStartChat = useCallback(() => {
    if (activeSourceIds.length > 0) {
      setLeftTab('chat');
    }
  }, [activeSourceIds, setLeftTab]);
  
  const handleDownload = useCallback(() => {
    const filesToDownload = (book.files ?? []).filter(file =>
      activeSourceIds.includes(file.id)
    );

    if (filesToDownload.length === 0) {
      return;
    }

    filesToDownload.forEach((file) => {
      let html = file.content ?? '';

      // <br> を改行に置換
      html = html.replace(/<br\s*\/?>/gi, '\n');

      // <p> と </p> を改行に置換（開始タグは無視、終了タグで改行）
      html = html.replace(/<p[^>]*>/gi, ''); // <p>を削除
      html = html.replace(/<\/p>/gi, '\n');  // </p>を改行に

      // その他のタグを削除
      html = html.replace(/<[^>]+>/g, '');

      // 連続する改行をそのまま保持する
      const text = html;

      const filename = file.title.endsWith('.txt') ? file.title : `${file.title}.txt`;
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }, [book, activeSourceIds]);

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg">ファイル管理</h2>
          <Button
            size="sm"
            onClick={() => setShowNewFileDialog(true)}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            新規
          </Button>
        </div>
        
        {/* アップロードエリア */}
        <div
          className={`dropzone p-4 mb-3 cursor-pointer ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              ファイルをドラッグ&ドロップ
              <br />
              または<span className="text-blue-600">クリックして選択</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, TXT, MD, DOCX対応
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 検索・ソート */}
        <div className="space-y-2">
          <Input
            placeholder="ファイルを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="title">タイトル順</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={files.length === 0}
            >
              全選択
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectNone}
              disabled={activeSourceIds.length === 0}
            >
              解除
            </Button>
          </div>
        </div>
      </div>

      {/* ファイル一覧 */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedFiles.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>ファイルがありません</p>
            <p className="text-sm mt-1">新規作成またはアップロードしてください</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className={`file-item p-3 mb-2 rounded border cursor-pointer transition-colors ${
                  activeFileId === file.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={activeSourceIds.includes(file.id)}
                    onChange={() => handleToggleSelect(file.id)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <FileText className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => handleFileClick(file.id)}
                  >
                    <h3 className="font-medium text-sm truncate">{file.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {file.content.substring(0, 100)}...
                    </p>
                  </div>

                {/* 🔥 削除ボタン */}
                <button
                  className="p-1 rounded hover:bg-red-50 text-red-500"
                  onClick={(e) => {
                    e.stopPropagation(); // クリックが file-item に伝播しないように
                    setActiveFileState(file);  // 削除対象のファイルをセット
                    setShowDeleteDialog(true); // ダイアログを表示
                  }}
                >
                  <Trash className="w-4 h-4" />
                </button>

                {/* ファイル削除確認ダイアログ */}
                {showDeleteDialog && activeFile && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-red-600">ファイルを削除</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteDialog(false)}
                          className="p-1"
                        >
                          ×
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                          <p className="mb-2">以下のファイルを削除しますか？</p>
                          <p className="font-medium text-gray-800 bg-gray-100 p-2 rounded">
                            {activeFile.title}
                          </p>
                          <p className="text-red-600 mt-2 text-xs">
                            ⚠️ この操作は元に戻せません。
                          </p>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(false)}
                          >
                            キャンセル
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              handleDeleteFile(activeFile.id); // 実際に削除
                              setShowDeleteDialog(false);       // ダイアログを閉じる
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            削除する
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {activeSourceIds.length}件選択中
          </span>
          <Button
            variant="default"
            onClick={handleDownload}
            disabled={activeSourceIds.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            ダウンロード
          </Button>
          <Button
            variant="default"
            onClick={handleStartChat}
            disabled={activeSourceIds.length === 0}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            チャット
          </Button>
        </div>
      </div>

      {/* 新規ファイル作成ダイアログ */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新しいファイルを作成</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewFileDialog(false)}
                className="p-1"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ファイル名</label>
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="ファイル名を入力..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewFile();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowNewFileDialog(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreateNewFile}
                  disabled={!newFileName.trim()}
                >
                  作成
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
