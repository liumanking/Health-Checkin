import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Archive, GripVertical, Tag as TagIcon, Trash2 } from 'lucide-react';
import type { Category } from '@/domain/entities/category';
import type { Habit } from '@/domain/entities/habit';
import type { Tag } from '@/domain/entities/tag';

interface Props {
  habit: Habit;
  categories: Category[];
  tags: Tag[];
  selectedTagIds: string[];
  onSetCategory: (categoryId: string | undefined) => void;
  onOpenTags: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function SortableHabitRow({
  habit,
  categories,
  tags,
  selectedTagIds,
  onSetCategory,
  onOpenTags,
  onArchive,
  onDelete,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  });

  const selectedTags = tags.filter((t) => selectedTagIds.includes(t.id));

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`拖曳排序 ${habit.name}`}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center text-gray-400 active:bg-gray-100"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} aria-hidden />
        </button>
        <span className="text-xl" aria-hidden>
          {habit.emoji}
        </span>
        <p className="min-w-0 flex-1 truncate font-medium text-gray-900">{habit.name}</p>
        <button
          type="button"
          aria-label={`封存 ${habit.name}`}
          onClick={onArchive}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 active:bg-gray-100"
        >
          <Archive size={18} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`刪除 ${habit.name}`}
          onClick={onDelete}
          className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 active:bg-red-50 active:text-red-500"
        >
          <Trash2 size={18} aria-hidden />
        </button>
      </div>

      <div className="flex items-center gap-2 pl-11">
        <select
          aria-label={`${habit.name} 的分類`}
          value={habit.categoryId ?? ''}
          onChange={(e) => onSetCategory(e.target.value === '' ? undefined : e.target.value)}
          className="h-8 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 outline-none"
        >
          <option value="">無分類</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onOpenTags}
          aria-label={`編輯 ${habit.name} 的標籤`}
          className="flex h-8 min-w-8 shrink-0 items-center gap-1 rounded-lg bg-gray-50 px-2 text-xs text-gray-500"
        >
          <TagIcon size={14} aria-hidden />
          {selectedTags.length > 0 && <span>{selectedTags.length}</span>}
        </button>

        <div className="flex flex-wrap gap-1">
          {selectedTags.map((t) => (
            <span key={t.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              #{t.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
