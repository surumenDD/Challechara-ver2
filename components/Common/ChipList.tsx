'use client';

import { X } from 'lucide-react';

interface ChipItem {
  id: string;
  label: string;
}

interface ChipListProps {
  items: ChipItem[];
  extraCount?: number;
  onRemove?: (id: string) => void;
  maxWidth?: string;
}

export default function ChipList({ items, extraCount = 0, onRemove, maxWidth = "240px" }: ChipListProps) {
  if (items.length === 0 && extraCount === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" style={{ maxWidth }}>
      {items.map((item) => (
        <div key={item.id} className="chip">
          <span className="truncate max-w-24" title={item.label}>
            {item.label}
          </span>
          {onRemove && (
            <button
              onClick={() => onRemove(item.id)}
              className="chip-close"
              aria-label={`${item.label}を削除`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      
      {extraCount > 0 && (
        <div className="chip">
          <span>+{extraCount}</span>
        </div>
      )}
    </div>
  );
}