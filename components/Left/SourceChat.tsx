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
    books,
    selectedEpisodeIds,
    setSelectedEpisodeIds,
    sourceChats,
    addSourceChatMessage
  } = useStore();

  const book = books.find(b => b.id === bookId);
  const episodes = book?.episodes || [];
  const chatMessages = sourceChats[bookId] || [];

  // 選択されたエピソードの情報
  const selectedEpisodes = episodes.filter(episode =>
    selectedEpisodeIds.includes(episode.id)
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
      // AIレスポンスを取得（選択されたファイルの内容をコンテキストとして使用）
      const sources = [`project:${bookId}:${selectedFiles.map(f => f.title).join(',')}`];
      const response = await chatProvider.send([...chatMessages, userMessage], {
        sources,
        chatType: 'project'
      });
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
    const newSelection = selectedEpisodeIds.filter(id => id !== sourceId);
    setSelectedEpisodeIds(newSelection);
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg mb-3">エピソードチャット</h2>

        {/* 使用中エピソードチップ */}
        <ChipList
          items={selectedEpisodes.slice(0, 5).map(episode => ({
            id: episode.id,
            label: episode.title
          }))}
          extraCount={selectedEpisodes.length > 5 ? selectedEpisodes.length - 5 : 0}
          onRemove={handleRemoveSource}
          maxWidth="100%"
        />

        {selectedEpisodes.length === 0 && (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            エピソードが選択されていません。「ファイル管理」タブで選択してください。
          </div>
        )}

        {selectedEpisodes.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            選択中のエピソード内容を参考にして回答します
          </div>
        )}
      </div>

      {/* チャットエリア */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow messages={chatMessages} />
        <Composer
          onSend={handleSendMessage}
          disabled={selectedFiles.length === 0}
          placeholder="プロジェクト内のファイルについて質問する..."
        />
      </div>
    </div>
  );
}