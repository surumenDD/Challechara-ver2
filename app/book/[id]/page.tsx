'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import Header from '@/components/Header';
import Panels from '@/components/Panels';
import SourceManager from '@/components/Left/SourceManager';
import FileManager from '@/components/Left/FileManager';
import SourceChat from '@/components/Left/SourceChat';
import TitleBar from '@/components/Editor/TitleBar';
import RichEditor from '@/components/Editor/RichEditor';
import DictionarySearch from '@/components/Right/DictionarySearch';
import MaterialUpload from '@/components/Right/MaterialUpload';
import MaterialChat from '@/components/Right/MaterialChat';

export default function EditorPage() {
  const params = useParams();
  const bookId = params.id as string;
  
  const { 
    books, 
    ui, 
    setLeftTab, 
    setRightTab, 
    setRightSubTab,
    setRightPanelOpen,
    setCurrentBookId,
    initializeBooks
  } = useStore();

  const [isTablet, setIsTablet] = useState(false);

  const book = books.find(b => b.id === bookId);

  useEffect(() => {
    console.log('Editor page loaded for book:', bookId);
    console.log('Available books:', books.map(b => b.id));
    setCurrentBookId(bookId);
    
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1280);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [bookId, setCurrentBookId]);

  // ブックが見つからない場合、ダミーブックを生成
  useEffect(() => {
    if (!book && books.length === 0) {
      console.log('No books found, initializing...');
      initializeBooks();
    }
  }, [book, books.length, initializeBooks]);

  if (!book) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              ブックが見つかりません
            </h2>
            <p className="text-gray-600">
              指定されたブックは存在しないか、削除されている可能性があります。
            </p>
            <Button
              variant="default"
              onClick={() => window.location.href = '/'}
              className="mt-4"
            >
              ホームに戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 左パネル
  const leftPanel = (
    <div className="h-full flex flex-col">
      {/* タブ */}
      <div className="tab-list">
        <button 
          className={`tab-button ${ui.leftTab === 'files' ? 'active' : ''}`}
          onClick={() => setLeftTab('files')}
        >
          ファイル管理
        </button>
        <button 
          className={`tab-button ${ui.leftTab === 'chat' ? 'active' : ''}`}
          onClick={() => setLeftTab('chat')}
        >
          プロジェクトチャット
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-hidden">
        {ui.leftTab === 'files' ? (
          <FileManager bookId={bookId} />
        ) : (
          <SourceChat bookId={bookId} />
        )}
      </div>
    </div>
  );

  // 中央パネル
  const centerPanel = (
    <div className="h-full flex flex-col">
      <TitleBar bookId={bookId} />
      <div className="flex-1 overflow-hidden">
        <RichEditor bookId={bookId} />
      </div>
    </div>
  );

  // 右パネル
  const rightPanel = (
    <div className="h-full flex flex-col">
      {/* タブレット用ヘッダー */}
      {isTablet && (
        <div className="p-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold">辞書・資料</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelOpen(false)}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 上位タブ */}
      <div className="tab-list">
        <button 
          className={`tab-button ${ui.rightTab === 'dict' ? 'active' : ''}`}
          onClick={() => setRightTab('dict')}
        >
          辞書・表現検索
        </button>
        <button 
          className={`tab-button ${ui.rightTab === 'material' ? 'active' : ''}`}
          onClick={() => setRightTab('material')}
        >
          資料検索
        </button>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-hidden">
        {ui.rightTab === 'dict' ? (
          <DictionarySearch bookId={bookId} />
        ) : (
          <div className="h-full flex flex-col">
            {/* ミニタブ */}
            <div className="tab-list border-b-0">
              <button 
                className={`tab-button ${ui.rightSubTab === 'upload' ? 'active' : ''}`}
                onClick={() => setRightSubTab('upload')}
              >
                資料アップロード
              </button>
              <button 
                className={`tab-button ${ui.rightSubTab === 'chat' ? 'active' : ''}`}
                onClick={() => setRightSubTab('chat')}
              >
                資料チャット
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {ui.rightSubTab === 'upload' ? (
                <MaterialUpload bookId={bookId} />
              ) : (
                <MaterialChat bookId={bookId} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex items-center justify-between">
        <Header />
        {/* タブレット用右パネル開閉ボタン */}
        {isTablet && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightPanelOpen(!ui.rightPanelOpen)}
            className="mr-4"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <Panels
          leftPanel={leftPanel}
          centerPanel={centerPanel}
          rightPanel={rightPanel}
        />
      </div>
    </div>
  );
}
