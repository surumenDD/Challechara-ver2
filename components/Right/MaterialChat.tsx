'use client';

import { useStore } from '@/lib/store';
import ChatWindow from '../Chat/ChatWindow';
import Composer from '../Chat/Composer';
import ChipList from '../Common/ChipList';
import { chatProvider } from '@/lib/chatProvider';

interface MaterialChatProps {
  bookId: string;
}

export default function MaterialChat({ bookId }: MaterialChatProps) {
  const {
    books,
    selectedMaterialIds,
    setSelectedMaterialIds,
    materialChats,
    addMaterialChatMessage
  } = useStore();

  const book = books.find(b => b.id === bookId);
  const bookMaterials = book?.materials || [];
  const chatMessages = materialChats[bookId] || [];

  // 選択された資料の情報
  const selectedMaterials = bookMaterials.filter(material =>
    selectedMaterialIds.includes(material.id)
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
    addMaterialChatMessage(bookId, userMessage);

    try {
      // AIレスポンスを取得
      const sources = [`material:${bookId}:${selectedMaterials.map(m => m.id).join(',')}`];
      const response = await chatProvider.send([...chatMessages, userMessage], {
        sources,
        chatType: 'material'
      });
      addMaterialChatMessage(bookId, response);
    } catch (error) {
      console.error('資料チャット送信エラー:', error);
      const errorMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: 'エラーが発生しました。もう一度お試しください。',
        ts: Date.now()
      };
      addMaterialChatMessage(bookId, errorMessage);
    }
  };

  // チップ削除
  const handleRemoveMaterial = (materialId: string) => {
    const newSelection = selectedMaterialIds.filter(id => id !== materialId);
    setSelectedMaterialIds(newSelection);
  };

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-sm text-gray-700 mb-3">資料チャット</h3>

        {/* 使用中資料チップ */}
        <ChipList
          items={selectedMaterials.slice(0, 5).map(material => ({
            id: material.id,
            label: material.title
          }))}
          extraCount={selectedMaterials.length > 5 ? selectedMaterials.length - 5 : 0}
          onRemove={handleRemoveMaterial}
          maxWidth="100%"
        />

        {selectedMaterials.length === 0 && (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
            資料が選択されていません。「資料アップロード」タブで選択してください。
          </div>
        )}
      </div>

      {/* チャットエリア */}
      <div className="flex-1 flex flex-col min-h-0">
        <ChatWindow messages={chatMessages} />
        <Composer
          onSend={handleSendMessage}
          disabled={selectedMaterials.length === 0}
          placeholder="選択した資料について質問する..."
        />
      </div>
    </div>
  );
}