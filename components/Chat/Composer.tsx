'use client';

import { useState, useCallback } from 'react';
import { Button } from '@openameba/spindle-ui';
import { Send } from 'lucide-react';

interface ComposerProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function Composer({ onSend, disabled = false, placeholder = "メッセージを入力..." }: ComposerProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || disabled || isSubmitting) return;

    setIsSubmitting(true);
    setContent('');

    try {
      await onSend(trimmedContent);
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, disabled, isSubmitting, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSubmitting}
          rows={3}
          className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || disabled || isSubmitting}
          variant="contained"
          size="small"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Enterで送信、Shift+Enterで改行
      </p>
    </div>
  );
}