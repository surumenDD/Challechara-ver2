'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
  const { books, updateProjectFile } = useStore();
  const [showRubyModal, setShowRubyModal] = useState(false);
  const [rubyText, setRubyText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const book = books.find(b => b.id === bookId);
  const activeFile = book?.files?.find(f => f.id === book.activeFileId);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: activeFile?.content || '<p>ファイルを選択または作成してください...</p>',
    onUpdate: ({ editor }) => {
      // アクティブファイルの内容を自動保存
      if (activeFile) {
        const content = editor.getHTML();
        const updatedFile = { 
          ...activeFile, 
          content, 
          updatedAt: Date.now() 
        };
        updateProjectFile(bookId, updatedFile);
      }
    },
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none ${!activeFile ? 'pointer-events-none opacity-50' : ''}`,
      },
    },
  });

  // アクティブファイル変更時にエディタ内容を更新
  useEffect(() => {
    if (editor) {
      if (activeFile) {
        if (editor.getHTML() !== activeFile.content) {
          editor.commands.setContent(activeFile.content);
        }
      } else {
        editor.commands.setContent('<p>ファイルを選択または作成してください...</p>');
      }
    }
  }, [editor, activeFile?.content, activeFile?.id]);

  // ルビ振り機能
  const handleAddRuby = useCallback(() => {
    if (!textareaRef.current || !activeEpisode) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    if (selectedText && selectedText.trim()) {
      setSelectionStart(start);
      setSelectionEnd(end);
      setShowRubyModal(true);
    } else {
      alert('ルビを振りたい文字を選択してください');
    }
  }, [content, activeEpisode]);

  const applyRuby = useCallback(() => {
    if (!rubyText.trim()) return;
    
    // ルビの長さ制限
    if (rubyText.length > MAX_RUBY_LENGTH) {
      alert(`ルビは${MAX_RUBY_LENGTH}文字以内にしてください`);
      return;
    }
    
    const selectedText = content.substring(selectionStart, selectionEnd);
    
    // 選択テキストの長さ制限
    if (selectedText.length > MAX_SELECTION_LENGTH) {
      alert(`ルビを振るテキストは${MAX_SELECTION_LENGTH}文字以内にしてください`);
      return;
    }
    
    const rubyNotation = `|${selectedText}《${rubyText}》`;
    const before = content.substring(0, selectionStart);
    const after = content.substring(selectionEnd);
    const newContent = before + rubyNotation + after;
    
    setContent(newContent);
    setShowRubyModal(false);
    setRubyText('');
    
    // 自動保存をトリガー
    if (activeEpisode) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        const htmlContent = convertToHtml(newContent);
        try {
          await updateEpisode(activeEpisode.id, { content: htmlContent });
          await refreshBookFromBackend(bookId);
        } catch (error) {
          console.error('Failed to save episode:', error);
        }
      }, 500);
    }
    
    // カーソル位置を調整
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = selectionStart + rubyNotation.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  }, [content, selectionStart, selectionEnd, rubyText, activeEpisode, bookId, convertToHtml, refreshBookFromBackend]);

  return (
    <div className="h-full flex flex-col">
      {/* ツールバー */}
      <div className="p-3 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-1">
        {/* 基本装飾 */}
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="p-2"
          title="太字 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
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
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="p-2"
          title="見出し1"
        >
          <Heading1 className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="p-2"
          title="見出し2"
        >
          <Heading2 className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
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
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="p-2"
          title="箇条書き"
        >
          <List className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
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
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="p-2"
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </Button>
        
        <Button
          variant={editor.isActive('code') ? 'default' : 'ghost'}
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
        { isMounted ? <EditorContent editor={editor} /> : <div className="p-8 text-center text-gray-500">Loading editor...</div> }
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
                プレビュー: <ruby>{selectedText}<rt>{rubyText}</rt></ruby>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowRubyModal(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="default"
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