'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@openameba/spindle-ui';
import { Input } from '@/components/ui/input';
import { Upload, Search, ChevronDown } from 'lucide-react';
import { useStore, Episode } from '@/lib/store';
import { extractText } from '@/lib/file';
import SourceItem from './SourceItem';

interface SourceManagerProps {
  bookId: string;
}

export default function SourceManager({ bookId }: SourceManagerProps) {
  const {
    episodes,
    addEpisode,
    activeSourceIds,
    setActiveSourceIds,
    setLeftTab
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bookEpisodes = episodes[bookId] || [];

  // ファイルアップロード処理
  const handleFiles = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      if (file.type.match(/^(text\/|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document))/)) {
        try {
          const content = await extractText(file);
          const episode: Episode = {
            id: `episode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            content,
            createdAt: Date.now()
          };
          addEpisode(bookId, episode);
        } catch (error) {
          console.error('ファイル処理エラー:', error);
        }
      }
    }
  }, [bookId, addEpisode]);

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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // ファイル選択
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // フィルタリング・ソート
  const filteredAndSortedEpisodes = bookEpisodes
    .filter(episode => 
      episode.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  // 選択処理
  const handleToggleSelect = useCallback((episodeId: string) => {
    const newSelection = activeSourceIds.includes(episodeId)
      ? activeSourceIds.filter(id => id !== episodeId)
      : [...activeSourceIds, episodeId];
    setActiveSourceIds(newSelection);
  }, [activeSourceIds, setActiveSourceIds]);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredAndSortedEpisodes.map(e => e.id);
    setActiveSourceIds(allIds);
  }, [filteredAndSortedEpisodes, setActiveSourceIds]);

  const handleSelectNone = useCallback(() => {
    setActiveSourceIds([]);
  }, [setActiveSourceIds]);

  // 検索実行
  const handleSearch = useCallback(() => {
    if (activeSourceIds.length > 0) {
      setLeftTab('chat');
    }
  }, [activeSourceIds, setLeftTab]);

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg mb-3">ソース管理</h2>
        
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
            placeholder="ソースを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="sm"
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
              disabled={bookEpisodes.length === 0}
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

      {/* ソース一覧 */}
      <div className="flex-1 overflow-y-auto">
        {filteredAndSortedEpisodes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>ソースがありません</p>
            <p className="text-sm mt-1">ファイルをアップロードしてください</p>
          </div>
        ) : (
          <div className="p-2">
            {filteredAndSortedEpisodes.map((episode) => (
              <SourceItem
                key={episode.id}
                episode={episode}
                bookId={bookId}
                isSelected={activeSourceIds.includes(episode.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">
            {activeSourceIds.length}件選択中
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSearch}
            disabled={activeSourceIds.length === 0}
            className="flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            検索
          </Button>
        </div>
      </div>
    </div>
  );
}