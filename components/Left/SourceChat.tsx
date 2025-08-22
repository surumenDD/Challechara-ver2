'use client';

import { useStore } from '@/lib/store';
import ChatWindow from '../Chat/ChatWindow';
import Composer from '../Chat/Composer';
import ChipList from '../Common/ChipList';
import { chatProvider } from '@/lib/chatProvider';

interface SourceChatProps {
  bookId: string;
}

export default function SourceChat({ bookId }: SourceChatProps) {
  const {
    episodes,
    activeSourceIds,
    sourceChats,
    addSourceChatMessage,
    setActiveSourceIds
  } = useStore();

  const bookEpisodes = episodes[bookId] || [];
  const chatMessages = sourceChats[bookId] || [];
  
  // 選択されたソースの情報
  const selectedSources = bookEpisodes.filter(episode => 
    activeSourceIds.includes(episode.id)
  );

  // メッセージ送信
  const handleSendMessage = async (content: string) => {
    // ユーザーメッセージを追加
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content,
      ts: Date.now()
    };
    addSourceChatMessage(bookId, userMessage);

    try {
      // AIレスポンスを取得
      const sources = selectedSources.map(s => s.title);
      const response = await chatProvider.send([...chatMessages, userMessage], { sources });
      addSourceChatMessage(bookId, response);
    } catch (error) {
      console.error('チャット送信エラー:', error);
      const errorMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: 'エラーが発生しました。もう一度お試しください。',
        ts: Date.now()
      };
      addSourceChatMessage(bookId, errorMessage);
    }
  };

  // チップ削除
  const handleRemoveSource = (sourceId: string) => {
    const newSelection = activeSourceIds.filter(id => id !== sourceId);
    setActiveSourceIds(newSelection);
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg mb-3">ソースチャット</h2>
        
        {/* 使用中ソースチップ */}
        <ChipList
          items={selectedSources.slice(0, 5).map(source => ({
            id: source.id,
            label: source.title
          }))}
          extraCount={selectedSources.length > 5 ? selectedSources.length - 5 : 0}
          onRemove={handleRemoveSource}
          maxWidth="100%"
        />

        {selectedSources.length === 0 && (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            ソースが選択されていません。「ソース管理」タブで選択してください。
          </div>
        )}
      </div>

      {/* チャットエリア */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow messages={chatMessages} />
        <Composer 
          onSend={handleSendMessage}
          disabled={selectedSources.length === 0}
          placeholder="選択したソースについて質問する..."
        />
      </div>
    </div>
  );
}