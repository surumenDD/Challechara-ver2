'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, BookOpen } from 'lucide-react';
import { useStore } from '@/lib/store';
import { exportAsTxt } from '@/lib/file';
import Header from '@/components/Header';
import Toolbar from '@/components/home/Toolbar';
import BookGrid from '@/components/home/BookGrid';
import BookList from '@/components/home/BookList';
import EmptyState from '@/components/Common/EmptyState';

export default function HomePage() {
  const router = useRouter();
  const {
    books,
    viewMode,
    sortOrder,
    query,
    createBook,
    updateBook,
    deleteBook,
    initializeBooks
  } = useStore();

  const [showNewBookDialog, setShowNewBookDialog] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');

  // 初期データ読み込み
  useEffect(() => {
    initializeBooks();
  }, [initializeBooks]);

  // デバッグ用：ブック数をログ出力
  useEffect(() => {
    console.log('Books count:', books.length);
    console.log('Books:', books);
  }, [books]);

  // フィルタリング・ソート
  const filteredAndSortedBooks = books
    .filter(book =>
      !book.archived &&
      book.title.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return b.updatedAt - a.updatedAt;
        case 'oldest':
          return a.updatedAt - b.updatedAt;
        case 'titleAsc':
          return a.title.localeCompare(b.title);
        case 'titleDesc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  // 新規ブック作成
  const handleNewBook = () => {
    setShowNewBookDialog(true);
  };

  const handleCreateBook = async () => {
    if (!newBookTitle.trim()) return;

    try {
      // バックエンドAPIを使用してブックを作成
      const newBook = await createBook(newBookTitle.trim(), '📖');

      setShowNewBookDialog(false);
      setNewBookTitle('');

      // 作成したブックを開く
      router.push(`/book/${newBook.id}`);
    } catch (error) {
      console.error('Error creating book:', error);
      alert('ブックの作成中にエラーが発生しました。もう一度お試しください。');
    }
  };

  // ブックアクション
  const handleBookClick = (bookId: string) => {
    console.log('Navigating to book:', bookId);
    router.push(`/book/${bookId}`);
  };

  const handleBookAction = async (bookId: string, action: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    switch (action) {
      case 'open':
        router.push(`/book/${bookId}`);
        break;

      case 'rename':
        const newTitle = prompt('新しいタイトルを入力してください:', book.title);
        if (newTitle && newTitle.trim() !== book.title) {
          updateBook({ ...book, title: newTitle.trim(), updatedAt: Date.now() });
        }
        break;

      case 'export':
        exportAsTxt(book.title, book.content || '');
        break;

      case 'delete':
        if (confirm(`「${book.title}」を削除しますか？この操作は取り消せません。`)) {
          deleteBook(bookId);
        }
        break;
    }
  };

  // ESCキーでダイアログを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewBookDialog(false);
      }
    };

    if (showNewBookDialog) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showNewBookDialog]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <Toolbar onNewBook={handleNewBook} />

      <main className="flex-1 overflow-y-auto">
        {filteredAndSortedBooks.length === 0 ? (
          <EmptyState
            icon={<BookOpen />}
            title={query ? '検索結果が見つかりません' : 'ブックがありません'}
            description={query ? '別のキーワードで検索してみてください' : '新しいブックを作成して執筆を始めましょう'}
            action={
              <Button variant="default" onClick={handleNewBook}>
                新しいブックを作成
              </Button>
            }
          />
        ) : viewMode === 'grid' ? (
          <BookGrid
            books={filteredAndSortedBooks}
            onBookClick={handleBookClick}
            onBookAction={handleBookAction}
            onNewBook={handleNewBook}
          />
        ) : (
          <BookList
            books={filteredAndSortedBooks}
            onBookClick={handleBookClick}
            onBookAction={handleBookAction}
          />
        )}
      </main>

      {/* 新規作成ダイアログ */}
      {showNewBookDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新しいブックを作成</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewBookDialog(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">タイトル</label>
                <Input
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="ブックのタイトルを入力..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateBook();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowNewBookDialog(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreateBook}
                  disabled={!newBookTitle.trim()}
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