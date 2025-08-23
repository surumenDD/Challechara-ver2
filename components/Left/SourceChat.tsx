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
    activeSourceIds,
    sourceChats,
    addSourceChatMessage,
    setActiveSourceIds
  } = useStore();

  const book = books.find(b => b.id === bookId);
  const projectFiles = book?.files || [];
  const chatMessages = sourceChats[bookId] || [];
  
  // 選択されたファイルの情報
  const selectedFiles = projectFiles.filter(file => 
    activeSourceIds.includes(file.id)
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
      const sources = selectedFiles.map(f => f.title);
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
        <h2 className="font-semibold text-lg mb-3">プロジェクトチャット</h2>
        
        {/* 使用中ファイルチップ */}
        <ChipList
          items={selectedFiles.slice(0, 5).map(file => ({
            id: file.id,
            label: file.title
          }))}
          extraCount={selectedFiles.length > 5 ? selectedFiles.length - 5 : 0}
          onRemove={handleRemoveSource}
          maxWidth="100%"
        />

        {selectedFiles.length === 0 && (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            ファイルが選択されていません。「ファイル管理」タブで選択してください。
          </div>
        )}
        
        {selectedFiles.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            選択中のファイル内容を参考にして回答します
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