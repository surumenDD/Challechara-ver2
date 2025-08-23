'use client';

import { useState } from 'react';
import { MoreVertical, Edit, Copy, Download, Trash2 } from 'lucide-react';
import { Book } from '@/lib/store';
import { formatDate } from '@/lib/file';

interface BookCardProps {
  book: Book;
  onClick: () => void;
  onAction: (action: string) => void;
}

export default function BookCard({ book, onClick, onAction }: BookCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    setShowMenu(false);
    onAction(action);
  };

  const handleCardClick = () => {
    console.log('Card clicked:', book.id);
    onClick();
  };

  return (
    <div
      className="h-44 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-4 cursor-pointer relative group"
      data-testid="book-card"
      onClick={handleCardClick}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
            {book.coverEmoji || '📖'}
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 rounded"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-44">
              <button
                onClick={(e) => handleMenuClick(e, 'open')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg"
              >
                開く
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={(e) => handleMenuClick(e, 'rename')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                名前変更...
              </button>
              <button
                onClick={(e) => handleMenuClick(e, 'duplicate')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                複製
              </button>
              <button
                onClick={(e) => handleMenuClick(e, 'export')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                エクスポート
              </button>
              <div className="border-t border-gray-100" />
              <button
                onClick={(e) => handleMenuClick(e, 'delete')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 last:rounded-b-lg"
              >
                <Trash2 className="w-4 h-4" />
                削除...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* タイトル */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-base leading-snug">
          {book.title}
        </h3>
      </div>

      {/* フッター */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{formatDate(book.updatedAt)}</span>
          <span>{book.sourceCount}個のソース</span>
        </div>
      </div>

      {/* 外側クリックでメニューを閉じる */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}
    </div>
  );
}