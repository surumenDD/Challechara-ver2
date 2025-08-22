'use client';

import { useState } from 'react';
import { Button } from '@openameba/spindle-ui';
import { Input } from '@/components/ui/input';
import { Search, Grid, List, ArrowUpDown, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';

interface ToolbarProps {
  onNewBook: () => void;
}

export default function Toolbar({ onNewBook }: ToolbarProps) {
  const { 
    query, 
    setQuery, 
    viewMode, 
    setViewMode, 
    sortOrder, 
    setSortOrder 
  } = useStore();
  
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === '/') {
      e.preventDefault();
      const input = e.currentTarget as HTMLInputElement;
      input.focus();
    }
  };

  const sortOptions = [
    { value: 'newest', label: '新しい順' },
    { value: 'oldest', label: '古い順' },
    { value: 'titleAsc', label: 'タイトル A→Z' },
    { value: 'titleDesc', label: 'タイトル Z→A' }
  ] as const;

  const currentSortLabel = sortOptions.find(option => option.value === sortOrder)?.label || '新しい順';

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-4">
        {/* 左側: タブ */}
        <div className="tab-list">
          <button className="tab-button active">
            マイブック
          </button>
        </div>

        {/* 右側: 検索・操作 */}
        <div className="flex items-center gap-3">
          {/* 検索ボックス */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="ブックを検索... (/ でフォーカス)"
              className="w-80 pl-10 pr-4 h-8 text-sm"
            />
          </div>

          {/* 表示切替 */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'lighted'}
              size="small"
              onClick={() => setViewMode('grid')}
              title="グリッド表示"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'lighted'}
              size="small"
              onClick={() => setViewMode('list')}
              title="リスト表示"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* 並び替え */}
          <div className="relative">
            <Button
              variant="lighted"
              size="small"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <ArrowUpDown className="w-4 h-4" />
              {currentSortLabel}
            </Button>

            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-40">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOrder(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      sortOrder === option.value ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 新規作成ボタン */}
          <Button
            variant="contained"
            size="small"
            onClick={onNewBook}
          >
            <Plus className="w-4 h-4" />
            新規作成
          </Button>
        </div>
      </div>

      {/* クリック外しでメニューを閉じる */}
      {showSortMenu && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowSortMenu(false)}
        />
      )}
    </div>
  );
}