'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText } from 'lucide-react';
import { useStore } from '@/lib/store';
import { updateEpisode } from '@/lib/api/episodes';

interface TitleBarProps {
  bookId: string;
}

export default function TitleBar({ bookId }: TitleBarProps) {
  const {
    books,
    activeEpisodeId,
    setActiveEpisodeId,
    updateBook,
    refreshBookFromBackend,
  } = useStore();
  
  const [title, setTitle] = useState('');
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'pending'>('saved');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const book = books.find(b => b.id === bookId);
  const episodes = book?.episodes || [];
  const activeEpisode = episodes.find(e => e.id === activeEpisodeId);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
    }
  }, [book]);

  useEffect(() => {
    if (activeEpisode) {
      setEpisodeTitle(activeEpisode.title);
    }
  }, [activeEpisode]);

  // 書籍タイトル自動保存
  useEffect(() => {
    if (!book || title === book.title) return;

    setSaveStatus('pending');
    
    const timeoutId = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await updateBook(bookId, { title });
        setSaveStatus('saved');
      } catch (error) {
        console.error('Failed to update book title:', error);
        setSaveStatus('saved');
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, book, bookId, updateBook]);

  // エピソードタイトル自動保存
  useEffect(() => {
    if (!activeEpisode || episodeTitle === activeEpisode.title) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateEpisode(activeEpisode.id, { title: episodeTitle });
        await refreshBookFromBackend(bookId);
      } catch (error) {
        console.error('Failed to update episode title:', error);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [episodeTitle, activeEpisode, bookId, refreshBookFromBackend]);

  // エピソード切り替え
  const handleEpisodeChange = (episodeId: string) => {
    setActiveEpisodeId(episodeId);
  };

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
    <div className="p-4 border-b border-gray-200 bg-white space-y-3">
      {/* プロジェクトタイトル */}
      <div className="flex items-center justify-between gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="プロジェクトタイトルを入力..."
          className="flex-1 text-lg font-medium"
          variant="standard"
        />
        
        <div className={`text-sm font-medium ${getSaveStatusColor()}`}>
          {getSaveStatusText()}
        </div>
      </div>

      {/* エピソード管理 */}
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-gray-500" />
        
        {episodes.length > 0 ? (
          <Select value={activeEpisodeId || ''} onValueChange={handleEpisodeChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="エピソードを選択" />
            </SelectTrigger>
            <SelectContent>
              {episodes.map((episode) => (
                <SelectItem key={episode.id} value={episode.id}>
                  {episode.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex-1 text-sm text-gray-500 px-3 py-2">
            エピソードがありません
          </div>
        )}
      </div>

      {/* アクティブエピソードのタイトル編集 */}
      {activeEpisode && (
        <div>
          <Input
            value={episodeTitle}
            onChange={(e) => setEpisodeTitle(e.target.value)}
            placeholder="エピソード名を入力..."
            className="text-base"
            variant="standard"
          />
        </div>
      )}

    </div>
  );
}