import { BottomSheet } from '@/design-system/components/BottomSheet';
import type { Tag } from '@/domain/entities/tag';

interface Props {
  habitName: string | null; // null = 關閉
  tags: Tag[];
  selectedTagIds: string[];
  onToggle: (tagId: string, on: boolean) => void;
  onClose: () => void;
}

export function TagPickerSheet({ habitName, tags, selectedTagIds, onToggle, onClose }: Props) {
  return (
    <BottomSheet open={habitName !== null} title={`${habitName ?? ''} 的標籤`} onClose={onClose}>
      {tags.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-500">還沒有標籤，先在上面新增一個</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {tags.map((tag) => {
            const checked = selectedTagIds.includes(tag.id);
            return (
              <li key={tag.id}>
                <label className="flex min-h-11 items-center gap-3 rounded-xl px-2 active:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onToggle(tag.id, e.target.checked)}
                    className="h-5 w-5 rounded accent-indigo-500"
                  />
                  <span className="text-sm text-gray-900">#{tag.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </BottomSheet>
  );
}
