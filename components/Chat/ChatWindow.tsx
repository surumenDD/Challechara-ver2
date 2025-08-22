'use client';

import { useEffect, useRef } from 'react';
import { ChatMessage } from '@/lib/store';
import { formatRelativeTime } from '@/lib/file';

interface ChatWindowProps {
  messages: ChatMessage[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが追加されたら最下部にスクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-gray-500">
          <p>チャットを開始してください</p>
          <p className="text-sm mt-1">メッセージを入力して送信してください</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`chat-message ${message.role}`}
        >
          <div className="flex items-start gap-2 mb-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-white'
            }`}>
              {message.role === 'user' ? 'U' : 'A'}
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                {formatRelativeTime(message.ts)}
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}