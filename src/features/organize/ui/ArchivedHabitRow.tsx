import { ArchiveRestore } from 'lucide-react';
import type { Habit } from '@/domain/entities/habit';
import { Card } from '@/design-system/components/Card';

interface Props {
  habit: Habit;
  onRestore: () => void;
}

export function ArchivedHabitRow({ habit, onRestore }: Props) {
  return (
    <Card className="flex items-center gap-2 opacity-70">
      <span className="text-xl" aria-hidden>
        {habit.emoji}
      </span>
      <p className="min-w-0 flex-1 truncate font-medium text-gray-700">{habit.name}</p>
      <button
        type="button"
        aria-label={`取消封存 ${habit.name}`}
        onClick={onRestore}
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl text-gray-400 active:bg-gray-100"
      >
        <ArchiveRestore size={18} aria-hidden />
      </button>
    </Card>
  );
}
