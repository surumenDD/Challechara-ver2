'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText } from 'lucide-react';
import { useStore, ProjectFile } from '@/lib/store';

interface TitleBarProps {
  bookId: string;
}

export default function TitleBar({ bookId }: TitleBarProps) {
  const { 
    books, 
    updateBook, 
    addProjectFile,
    updateProjectFile,
    setActiveFile 
  } = useStore();
  
  const [title, setTitle] = useState('');
  const [fileTitle, setFileTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'pending'>('saved');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const book = books.find(b => b.id === bookId);
  const files = book?.files || [];
  const activeFile = files.find(f => f.id === book?.activeFileId);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
    }
  }, [book]);

  useEffect(() => {
    if (activeFile) {
      setFileTitle(activeFile.title);
    }
  }, [activeFile]);

  // プロジェクトタイトル自動保存
  useEffect(() => {
    if (!book || title === book.title) return;

    setSaveStatus('pending');
    
    const timeoutId = setTimeout(() => {
      setSaveStatus('saving');
      
      setTimeout(() => {
        const updatedBook = { ...book, title, updatedAt: Date.now() };
        updateBook(updatedBook);
        setSaveStatus('saved');
      }, 500);
      
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, book, updateBook]);

  // ファイルタイトル自動保存
  useEffect(() => {
    if (!activeFile || fileTitle === activeFile.title) return;

    const timeoutId = setTimeout(() => {
      const updatedFile = { ...activeFile, title: fileTitle, updatedAt: Date.now() };
      updateProjectFile(bookId, updatedFile);
      
      // ブックの更新日時も更新
      if (book) {
        updateBook({ ...book, updatedAt: Date.now() });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [fileTitle, activeFile, bookId, updateProjectFile, book, updateBook]);

  // ファイル切り替え
  const handleFileChange = (fileId: string) => {
    setActiveFile(bookId, fileId);
  };

  // 新規ファイル作成
  const handleCreateNewFile = () => {
    if (!newFileName.trim()) return;
    
    const fileName = newFileName.trim().endsWith('.txt') 
      ? newFileName.trim() 
      : `${newFileName.trim()}.txt`;
      
    const projectFile: ProjectFile = {
      id: `file-${Date.now()}`,
      title: fileName,
      content: `# ${fileName.replace('.txt', '')}\n\n`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    addProjectFile(bookId, projectFile);
    setActiveFile(bookId, projectFile.id);
    setShowNewFileDialog(false);
    setNewFileName('');
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

      {/* ファイル管理 */}
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-gray-500" />
        
        {files.length > 0 ? (
          <Select value={activeFile?.id || ''} onValueChange={handleFileChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="ファイルを選択" />
            </SelectTrigger>
            <SelectContent>
              {files.map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  {file.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex-1 text-sm text-gray-500 px-3 py-2">
            ファイルがありません
          </div>
        )}

        <Button
          size="sm"
          onClick={() => setShowNewFileDialog(true)}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          新規
        </Button>
      </div>

      {/* アクティブファイルのタイトル編集 */}
      {activeFile && (
        <div>
          <Input
            value={fileTitle}
            onChange={(e) => setFileTitle(e.target.value)}
            placeholder="ファイル名を入力..."
            className="text-base"
            variant="standard"
          />
        </div>
      )}

      {/* 新規ファイル作成ダイアログ */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">新しいファイルを作成</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewFileDialog(false)}
                className="p-1"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ファイル名</label>
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="ファイル名を入力..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewFile();
                    }
                  }}
                  autoFocus
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowNewFileDialog(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreateNewFile}
                  disabled={!newFileName.trim()}
                >
                  作成
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}