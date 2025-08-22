'use client';

import { useState, useCallback } from 'react';
import { MoreVertical, Download, Trash2 } from 'lucide-react';
import { Episode } from '@/lib/store';
import { useStore } from '@/lib/store';
import { exportAsTxt, formatRelativeTime } from '@/lib/file';

interface SourceItemProps {
  episode: Episode;
  bookId: string;
  isSelected: boolean;
  onToggleSelect: (episodeId: string) => void;
}

export default function SourceItem({ episode, bookId, isSelected, onToggleSelect }: SourceItemProps) {
  const { deleteEpisode } = useStore();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  // コンテキストメニュー表示
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);

    // 外側クリックで閉じる
    const handleClickOutside = (event: MouseEvent) => {
      setShowContextMenu(false);
      document.removeEventListener('click', handleClickOutside);
    };
    document.addEventListener('click', handleClickOutside);
  }, []);

  // TXTエクスポート
  const handleExport = useCallback(() => {
    exportAsTxt(episode.title, episode.content);
    setShowContextMenu(false);
  }, [episode.title, episode.content]);

  // 削除
  const handleDelete = useCallback(() => {
    if (confirm('このソースを削除しますか？')) {
      deleteEpisode(bookId, episode.id);
    }
    setShowContextMenu(false);
  }, [deleteEpisode, bookId, episode.id]);

  // ESCキーでメニューを閉じる
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowContextMenu(false);
    }
  }, []);

  return (
    <>
      <div 
        className={`p-3 mb-2 rounded-lg border transition-colors cursor-pointer ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => onToggleSelect(episode.id)}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-start gap-3">
          {/* チェックボックス */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(episode.id)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* コンテンツ */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 truncate mb-1">
              {episode.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {episode.content.substring(0, 100)}...
            </p>
            <div className="text-xs text-gray-500">
              {formatRelativeTime(episode.createdAt)}
            </div>
          </div>

          {/* メニューボタン */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* コンテキストメニュー */}
      {showContextMenu && (
        <div
          className="context-menu"
          style={{ 
            left: contextMenuPos.x, 
            top: contextMenuPos.y 
          }}
          onKeyDown={handleKeyDown}
        >
          <button
            className="context-menu-item"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            TXTエクスポート
          </button>
          <div className="context-menu-separator" />
          <button
            className="context-menu-item text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            削除
          </button>
        </div>
      )}
    </>
  );
}