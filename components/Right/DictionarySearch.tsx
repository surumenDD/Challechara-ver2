'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Book, Tag } from 'lucide-react';
import ChatWindow from '../Chat/ChatWindow';
import Composer from '../Chat/Composer';
import { useStore } from '@/lib/store';
import { chatProvider } from '@/lib/chatProvider';

interface DictionarySearchProps {
  bookId: string;
}

// ダミー辞書データ
const dummyDictionaryResults = [
  {
    id: '1',
    word: '美しい',
    reading: 'うつくしい',
    partOfSpeech: '形容詞',
    meanings: ['形や色などが整っていて、見て快く感じるさま'],
    examples: ['美しい景色', '美しい音楽'],
    synonyms: ['麗しい', '綺麗な', '素晴らしい']
  },
  {
    id: '2',
    word: '静謐',
    reading: 'せいひつ',
    partOfSpeech: '名詞・形容動詞',
    meanings: ['静かで落ち着いているさま'],
    examples: ['静謐な空間', '静謐な午後'],
    synonyms: ['静寂', '平穏', '閑静']
  }
];

export default function DictionarySearch({ bookId }: DictionarySearchProps) {
  const { dictChats, addDictChatMessage } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof dummyDictionaryResults>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 検索条件の状態
  const [searchOptions, setSearchOptions] = useState({
    meanings: true,
    examples: true,
    synonyms: true
  });

  const chatMessages = dictChats[bookId] || [];

  // Google検索を新しいタブで開く
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    // チェックされている条件を配列にまとめる
    const selectedOptions = Object.entries(searchOptions)
      .filter(([_, value]) => value)
      .map(([key]) => key === 'meanings' ? '意味' : key === 'examples' ? '例文' : '類語');

    // 検索クエリを結合
    const finalQuery = [searchQuery, ...selectedOptions].join(' ');

    const url = `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`;
    window.open(url, '_blank');
  }, [searchQuery, searchOptions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content,
      ts: Date.now()
    };
    addDictChatMessage(bookId, userMessage);

    try {
      const response = await chatProvider.send([...chatMessages, userMessage], {
        chatType: 'dictionary'
      });
      addDictChatMessage(bookId, response);
    } catch (error) {
      console.error('辞書チャット送信エラー:', error);
      const errorMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: 'エラーが発生しました。もう一度お試しください。',
        ts: Date.now()
      };
      addDictChatMessage(bookId, errorMessage);
    }
  }, [bookId, chatMessages, addDictChatMessage]);

  return (
    <div className="h-full flex flex-col">
      {/* 検索条件 */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div className="flex gap-4">
          {['meanings', 'examples', 'synonyms'].map((key) => (
            <label key={key} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={searchOptions[key as keyof typeof searchOptions]}
                onChange={() =>
                  setSearchOptions((prev) => ({
                    ...prev,
                    [key]: !prev[key as keyof typeof searchOptions]
                  }))
                }
              />
              <span className="capitalize text-sm">
                {key === 'meanings' ? '意味' : key === 'examples' ? '例文' : '類語'}
              </span>
            </label>
          ))}
        </div>

        {/* 検索ボックス */}
        <div className="flex gap-2 mt-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="単語・表現を検索..."
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            variant="default"
            size="sm"
            className="px-4"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* 検索結果（ダミー表示） */}
        {isSearching && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">検索中...</p>
          </div>
        )}

        {searchResults.length > 0 && !isSearching && (
          <div className="max-h-48 overflow-y-auto space-y-3">
            {searchResults.map((result) => (
              <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Book className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">{result.word}</span>
                  <span className="text-sm text-gray-600">({result.reading})</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {result.partOfSpeech}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* チャットエリア */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-3 border-b border-gray-200">
          <h3 className="font-medium text-sm text-gray-700">補助チャット</h3>
          <p className="text-xs text-gray-500 mt-1">表現や言い回しについて質問できます</p>
        </div>

        <ChatWindow messages={chatMessages} />
        <Composer
          onSend={handleSendMessage}
          placeholder="表現について質問する..."
        />
      </div>
    </div>
  );
}