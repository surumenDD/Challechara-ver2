'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Trash2 } from 'lucide-react';
import { useStore, Material } from '@/lib/store';
import { extractText } from '@/lib/file';
import ChipList from '../Common/ChipList';

interface MaterialUploadProps {
  bookId: string;
}

export default function MaterialUpload({ bookId }: MaterialUploadProps) {
  const {
    books,
    selectedMaterialIds,
    setSelectedMaterialIds,
    refreshBookFromBackend
  } = useStore();

  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const book = books.find(b => b.id === bookId);
  const bookMaterials = book?.materials || [];
  const selectedMaterials = bookMaterials.filter(material =>
    selectedMaterialIds.includes(material.id)
  );

  // ファイルアップロード処理
  const handleFiles = useCallback(async (files: FileList) => {
    const { createMaterial } = await import('@/lib/api/materials');
    
    for (const file of Array.from(files)) {
      try {
        const content = await extractText(file);
        const title = file.name.replace(/\.[^/.]+$/, '');
        await createMaterial(bookId, title, content);
        await refreshBookFromBackend(bookId);
      } catch (error) {
        console.error('資料アップロードエラー:', error);
      }
    }
  }, [bookId, refreshBookFromBackend]);

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
    const newSelection = selectedMaterialIds.includes(materialId)
      ? selectedMaterialIds.filter(id => id !== materialId)
      : [...selectedMaterialIds, materialId];
    setSelectedMaterialIds(newSelection);
  }, [selectedMaterialIds, setSelectedMaterialIds]);

  // 全選択・全解除
  const handleSelectAll = useCallback(() => {
    const allIds = bookMaterials.map(m => m.id);
    setSelectedMaterialIds(allIds);
  }, [bookMaterials, setSelectedMaterialIds]);

  const handleSelectNone = useCallback(() => {
    setSelectedMaterialIds([]);
  }, [setSelectedMaterialIds]);

  // チップ削除
  const handleRemoveMaterial = useCallback((materialId: string) => {
    const newSelection = selectedMaterialIds.filter(id => id !== materialId);
    setSelectedMaterialIds(newSelection);
  }, [selectedMaterialIds, setSelectedMaterialIds]);

  // 資料削除
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);

  const handleDeleteMaterial = useCallback(async (materialId: string) => {
    const targetMaterial = bookMaterials.find(m => m.id === materialId);
    if (!targetMaterial) return;
    
    setDeleteTarget(targetMaterial);
    setShowDeleteDialog(true);
  }, [bookMaterials]);

  const executeDelete = useCallback(async () => {
    if (!deleteTarget) return;
    
    try {
      const { deleteMaterial } = await import('@/lib/api/materials');
      await deleteMaterial(deleteTarget.id);
      await refreshBookFromBackend(bookId);
      
      // 選択からも削除
      const newSelection = selectedMaterialIds.filter(id => id !== deleteTarget.id);
      setSelectedMaterialIds(newSelection);
    } catch (error) {
      console.error('資料削除エラー:', error);
    } finally {
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget, bookId, selectedMaterialIds, setSelectedMaterialIds, refreshBookFromBackend]);

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg">資料管理</h2>
        </div>
        
        {/* アップロードエリア */}
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
              ファイルをドラッグ&ドロップ
              <br />
              または<span className="text-blue-600">クリックして選択</span>
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

        {/* 選択・ソート */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={bookMaterials.length === 0}
            >
              全選択
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectNone}
              disabled={selectedMaterialIds.length === 0}
            >
              解除
            </Button>
          </div>
        </div>
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
                className={`p-3 mb-2 rounded border cursor-pointer transition-colors ${
                  selectedMaterialIds.includes(material.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMaterialIds.includes(material.id)}
                    onChange={() => handleToggleSelect(material.id)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  <Upload className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  
                  <div 
                    className="flex-1 min-w-0"
                    onClick={() => handleToggleSelect(material.id)}
                  >
                    <h3 className="font-medium text-sm truncate">{material.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(material.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {material.content.substring(0, 100)}...
                    </p>
                  </div>

                  {/* 削除ボタン */}
                  <button
                    className="p-1 rounded hover:bg-red-50 text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMaterial(material.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 資料削除確認ダイアログ */}
      {showDeleteDialog && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">資料を削除</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(false)}
                className="p-1"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">以下の資料を削除しますか？</p>
                <p className="font-medium text-gray-800 bg-gray-100 p-2 rounded">
                  {deleteTarget.title}
                </p>
                <p className="text-red-600 mt-2 text-xs">
                  ⚠️ この操作は元に戻せません。
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={executeDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  削除する
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}