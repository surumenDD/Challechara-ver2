'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@openameba/spindle-ui';
import { Upload, X } from 'lucide-react';
import { useStore, Material } from '@/lib/store';
import { extractText, formatFileSize, formatRelativeTime } from '@/lib/file';
import ChipList from '../Common/ChipList';

interface MaterialUploadProps {
  bookId: string;
}

export default function MaterialUpload({ bookId }: MaterialUploadProps) {
  const {
    materials,
    addMaterial,
    deleteMaterial,
    activeMaterialIds,
    setActiveMaterialIds
  } = useStore();

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bookMaterials = materials[bookId] || [];
  const selectedMaterials = bookMaterials.filter(material => 
    activeMaterialIds.includes(material.id)
  );

  // ファイルアップロード処理
  const handleFiles = useCallback(async (files: FileList) => {
    for (const file of Array.from(files)) {
      try {
        const content = await extractText(file);
        const material: Material = {
          id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          content,
          createdAt: Date.now()
        };
        addMaterial(bookId, material);
      } catch (error) {
        console.error('資料アップロードエラー:', error);
      }
    }
  }, [bookId, addMaterial]);

  // ドラッグ&ドロップ
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // ファイル選択
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  // 資料選択
  const handleToggleSelect = useCallback((materialId: string) => {
    const newSelection = activeMaterialIds.includes(materialId)
      ? activeMaterialIds.filter(id => id !== materialId)
      : [...activeMaterialIds, materialId];
    setActiveMaterialIds(newSelection);
  }, [activeMaterialIds, setActiveMaterialIds]);

  // 全選択・全解除
  const handleSelectAll = useCallback(() => {
    const allIds = bookMaterials.map(m => m.id);
    setActiveMaterialIds(allIds);
  }, [bookMaterials, setActiveMaterialIds]);

  const handleSelectNone = useCallback(() => {
    setActiveMaterialIds([]);
  }, [setActiveMaterialIds]);

  // チップ削除
  const handleRemoveMaterial = useCallback((materialId: string) => {
    const newSelection = activeMaterialIds.filter(id => id !== materialId);
    setActiveMaterialIds(newSelection);
  }, [activeMaterialIds, setActiveMaterialIds]);

  // 資料削除
  const handleDeleteMaterial = useCallback((materialId: string) => {
    if (confirm('この資料を削除しますか？')) {
      deleteMaterial(bookId, materialId);
      // 選択からも削除
      const newSelection = activeMaterialIds.filter(id => id !== materialId);
      setActiveMaterialIds(newSelection);
    }
  }, [deleteMaterial, bookId, activeMaterialIds, setActiveMaterialIds]);

  return (
    <div className="h-full flex flex-col">
      {/* アップロードエリア */}
      <div className="p-4 border-b border-gray-200">
        <div
          className={`dropzone p-4 mb-3 cursor-pointer ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              資料をアップロード
              <br />
              <span className="text-blue-600">クリックまたはドラッグ&ドロップ</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, TXT, MD, DOCX対応
            </p>
          </div>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 選択操作 */}
        {bookMaterials.length > 0 && (
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                全選択
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectNone}
                disabled={activeMaterialIds.length === 0}
              >
                解除
              </Button>
            </div>
            <span className="text-sm text-gray-600">
              {activeMaterialIds.length}件選択中
            </span>
          </div>
        )}
      </div>

      {/* 選択中の資料チップ */}
      {selectedMaterials.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-sm text-gray-700 mb-2">選択中の資料</h3>
          <ChipList
            items={selectedMaterials.slice(0, 5).map(material => ({
              id: material.id,
              label: material.title
            }))}
            extraCount={selectedMaterials.length > 5 ? selectedMaterials.length - 5 : 0}
            onRemove={handleRemoveMaterial}
            maxWidth="100%"
          />
        </div>
      )}

      {/* 資料一覧 */}
      <div className="flex-1 overflow-y-auto">
        {bookMaterials.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>資料がありません</p>
            <p className="text-sm mt-1">ファイルをアップロードしてください</p>
          </div>
        ) : (
          <div className="p-2">
            {bookMaterials.map((material) => (
              <div 
                key={material.id}
                className={`p-3 mb-2 rounded-lg border transition-colors cursor-pointer ${
                  activeMaterialIds.includes(material.id)
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggleSelect(material.id)}
              >
                <div className="flex items-start gap-3">
                  {/* チェックボックス */}
                  <input
                    type="checkbox"
                    checked={activeMaterialIds.includes(material.id)}
                    onChange={() => handleToggleSelect(material.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* コンテンツ */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-gray-900 truncate mb-1">
                      {material.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {material.content.substring(0, 100)}...
                    </p>
                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(material.createdAt)}
                    </div>
                  </div>

                  {/* 削除ボタン */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMaterial(material.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}