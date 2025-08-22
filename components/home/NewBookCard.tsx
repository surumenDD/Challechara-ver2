'use client';

import { Plus } from 'lucide-react';

interface NewBookCardProps {
  onClick: () => void;
}

export default function NewBookCard({ onClick }: NewBookCardProps) {
  return (
    <div
      onClick={onClick}
      className="h-44 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer flex items-center justify-center group"
    >
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full border-2 border-gray-400 group-hover:border-blue-500 flex items-center justify-center transition-colors">
          <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
        <p className="text-gray-600 group-hover:text-blue-600 font-medium transition-colors">
          新しいブックを作成
        </p>
      </div>
    </div>
  );
}