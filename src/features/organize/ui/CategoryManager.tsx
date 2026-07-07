import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { Category } from '@/domain/entities/category';

interface Props {
  categories: Category[];
  onAdd: (name: string) => void;
  onDelete: (categoryId: string) => void;
}

export function CategoryManager({ categories, onAdd, onDelete }: Props) {
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
      <p className="text-sm font-medium text-gray-700">分類</p>
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((c) => (
          <span
            key={c.id}
            className="flex min-h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-white"
            style={{ backgroundColor: c.color }}
          >
            {c.name}
            <button
              type="button"
              aria-label={`刪除分類 ${c.name}`}
              onClick={() => onDelete(c.id)}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-black/15"
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
              placeholder="分類名稱"
              className="h-8 w-28 rounded-full border border-gray-300 px-3 text-sm outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={submit}
              aria-label="確認新增分類"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white"
            >
              <Plus size={16} aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label="新增分類"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500"
          >
            <Plus size={16} aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
}
