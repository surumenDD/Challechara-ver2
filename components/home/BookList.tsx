"use client";

import { MoreVertical, Edit, Copy, Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { Book } from "@/lib/store";
import { formatDate } from "@/lib/file";

interface BookListProps {
  books: Book[];
  onBookClick: (bookId: string) => void;
  onBookAction: (bookId: string, action: string) => void;
}

export default function BookList({
  books,
  onBookClick,
  onBookAction,
}: BookListProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuClick = (
    e: React.MouseEvent,
    bookId: string,
    action: string
  ) => {
    e.stopPropagation();
    setActiveMenu(null);
    onBookAction(bookId, action);
  };

  return (
    <div className="p-4">
      {/* ヘッダー */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-gray-600 border-b border-gray-200 mb-2">
        <div className="col-span-1"></div>
        <div className="col-span-4">タイトル</div>
        <div className="col-span-2">更新日</div>
        <div className="col-span-2">エピソード数</div>
        <div className="col-span-3"></div>
      </div>

      {/* リスト項目 */}
      <div className="space-y-1">
        {books.map((book) => (
          <div
            key={book.id}
            className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
            data-testid="book-list-item"
            onClick={() => onBookClick(book.id)}
          >
            {/* アイコン */}
            <div className="col-span-1 flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                📖
              </div>
            </div>

            {/* タイトル */}
            <div className="col-span-4 flex items-center">
              <span className="font-medium text-gray-900 truncate">
                {book.title}
              </span>
            </div>

            {/* 更新日 */}
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-gray-600">
                {new Date(book.updated_at).toLocaleDateString()}
              </span>
            </div>

            {/* エピソード数 */}
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-gray-600">
                {book.episodes?.length || 0}個
              </span>
            </div>

            {/* メニュー */}
            <div className="col-span-3 flex items-center justify-end">
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === book.id ? null : book.id);
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 rounded"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>

                {activeMenu === book.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-44">
                    <button
                      onClick={(e) => handleMenuClick(e, book.id, "open")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg"
                    >
                      開く
                    </button>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={(e) => handleMenuClick(e, book.id, "rename")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      名前変更...
                    </button>
                    <button
                      onClick={(e) => handleMenuClick(e, book.id, "duplicate")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      複製
                    </button>
                    <button
                      onClick={(e) => handleMenuClick(e, book.id, "export")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      エクスポート
                    </button>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={(e) => handleMenuClick(e, book.id, "delete")}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 last:rounded-b-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      削除...
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 外側クリックでメニューを閉じる */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
