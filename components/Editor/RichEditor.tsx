'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@openameba/spindle-ui';
import { Input } from '@/components/ui/input';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  X
} from 'lucide-react';
import { useStore } from '@/lib/store';

interface RichEditorProps {
  bookId: string;
}

export default function RichEditor({ bookId }: RichEditorProps) {
  const { books, updateBook } = useStore();
  const [showRubyModal, setShowRubyModal] = useState(false);
  const [rubyText, setRubyText] = useState('');
  const [selectedText, setSelectedText] = useState('');

  const book = books.find(b => b.id === bookId);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: book?.content || '<p>ここに本文を入力してください...</p>',
    onUpdate: ({ editor }) => {
      // 自動保存
      const content = editor.getHTML();
      if (book) {
        const updatedBook = { ...book, content, updatedAt: Date.now() };
        updateBook(updatedBook);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  });

  // ブック変更時にエディタ内容を更新
  useEffect(() => {
    if (editor && book && editor.getHTML() !== book.content) {
      editor.commands.setContent(book.content || '<p>ここに本文を入力してください...</p>');
    }
  }, [editor, book?.content]);

  // ルビ振り機能
  const handleAddRuby = useCallback(() => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    
    if (text) {
      setSelectedText(text);
      setShowRubyModal(true);
    }
  }, [editor]);

  const applyRuby = useCallback(() => {
    if (!editor || !selectedText || !rubyText) return;

    const rubyHtml = `<ruby><rb>${selectedText}</rb><rt>${rubyText}</rt></ruby>`;
    editor.chain().focus().insertContent(rubyHtml).run();
    
    setShowRubyModal(false);
    setRubyText('');
    setSelectedText('');
  }, [editor, selectedText, rubyText]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            editor?.chain().focus().toggleBold().run();
            break;
          case 'i':
            e.preventDefault();
            editor?.chain().focus().toggleItalic().run();
            break;
          case 'u':
            e.preventDefault();
            editor?.chain().focus().toggleUnderline?.().run();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  const getWordCount = () => {
    if (!editor) return 0;
    return editor.storage.characterCount?.characters() || 0;
  };

  if (!editor) {
    return <div className="p-4">エディタを読み込んでいます...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* ツールバー */}
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-1">
        {/* 基本装飾 */}
        <Button
          variant={editor.isActive('bold') ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="p-2"
          title="太字 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="p-2"
          title="斜体 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* 見出し */}
        <Button
          variant={editor.isActive('heading', { level: 1 }) ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="p-2"
          title="見出し1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="p-2"
          title="見出し2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="p-2"
          title="見出し3"
        >
          <Heading3 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* リスト */}
        <Button
          variant={editor.isActive('bulletList') ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-2"
          title="箇条書き"
        >
          <List className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('orderedList') ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="p-2"
          title="番号付きリスト"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* その他 */}
        <Button
          variant={editor.isActive('blockquote') ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="p-2"
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('code') ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="p-2"
          title="コード"
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* ルビ振り */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddRuby}
          className="p-2"
          title="ルビ振り"
          disabled={!editor.state.selection.empty === false}
        >
          <span className="text-xs font-bold">ルビ</span>
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2"
          title="元に戻す"
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2"
          title="やり直し"
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* エディタ */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* フッター */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
        <span className="text-sm text-gray-600">
          {getWordCount()} 文字
        </span>
      </div>

      {/* ルビ振りモーダル */}
      {showRubyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">ルビ振り</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRubyModal(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">選択されたテキスト</label>
                <div className="p-2 bg-gray-100 rounded text-sm">{selectedText}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">ルビ</label>
                <Input
                  value={rubyText}
                  onChange={(e) => setRubyText(e.target.value)}
                  placeholder="ふりがなを入力..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      applyRuby();
                    }
                  }}
                />
              </div>

              <div className="text-sm text-gray-600">
                プレビュー: <ruby><rb>{selectedText}</rb><rt>{rubyText}</rt></ruby>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowRubyModal(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="primary"
                  onClick={applyRuby}
                  disabled={!rubyText.trim()}
                >
                  適用
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}