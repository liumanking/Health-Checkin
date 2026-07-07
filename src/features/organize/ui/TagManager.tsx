import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { Tag } from '@/domain/entities/tag';

interface Props {
  tags: Tag[];
  onAdd: (name: string) => void;
  onDelete: (tagId: string) => void;
}

export function TagManager({ tags, onAdd, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed === '') return;
    onAdd(trimmed);
    setName('');
    setAdding(false);
  };

  return (
    <section className="flex flex-col gap-2">
      <p className="text-sm font-medium text-gray-700">標籤</p>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((t) => (
          <span
            key={t.id}
            className="flex min-h-8 items-center gap-1.5 rounded-full bg-gray-100 px-3 text-sm font-medium text-gray-700"
          >
            #{t.name}
            <button
              type="button"
              aria-label={`刪除標籤 ${t.name}`}
              onClick={() => onDelete(t.id)}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10"
            >
              <X size={12} aria-hidden />
            </button>
          </span>
        ))}

        {adding ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
                if (e.key === 'Escape') setAdding(false);
              }}
              placeholder="標籤名稱"
              className="h-8 w-28 rounded-full border border-gray-300 px-3 text-sm outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={submit}
              aria-label="確認新增標籤"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white"
            >
              <Plus size={16} aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label="新增標籤"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <Plus size={16} aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
}
