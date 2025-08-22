'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';

interface TitleBarProps {
  bookId: string;
}

export default function TitleBar({ bookId }: TitleBarProps) {
  const { books, updateBook } = useStore();
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'pending'>('saved');

  const book = books.find(b => b.id === bookId);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
    }
  }, [book]);

  // 自動保存
  useEffect(() => {
    if (!book || title === book.title) return;

    setSaveStatus('pending');
    
    const timeoutId = setTimeout(() => {
      setSaveStatus('saving');
      
      // 保存実行
      setTimeout(() => {
        const updatedBook = { ...book, title, updatedAt: Date.now() };
        updateBook(updatedBook);
        setSaveStatus('saved');
      }, 500); // 保存中の表示のため少し遅延
      
    }, 1000); // 1秒後に保存開始

    return () => clearTimeout(timeoutId);
  }, [title, book, updateBook]);

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return '保存中...';
      case 'pending':
        return '未保存';
      case 'saved':
        return '保存済み';
      default:
        return '';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-blue-600';
      case 'pending':
        return 'text-orange-600';
      case 'saved':
        return 'text-green-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトルを入力..."
          className="flex-1 text-lg font-medium border-none focus:ring-0"
        />
        
        <div className={`text-sm font-medium ${getSaveStatusColor()}`}>
          {getSaveStatusText()}
        </div>
      </div>
    </div>
  );
}