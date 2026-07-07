import { Plus } from 'lucide-react';
import type { TodayItem } from '@/application/queries/GetTodayListQuery';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';

function formatAmount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

interface Props {
  item: TodayItem;
  onRecord: (amount: number) => void;
  onOpenEntry: () => void;
}

/** 補登用列：任何類型都能手動輸入（計時類這裡不開即時碼表，直接補分鐘數）。 */
export function HistoryHabitRow({ item, onRecord, onOpenEntry }: Props) {
  const { habit, todayTotal, completed } = item;

  return (
    <Card className="flex items-center gap-3" style={{ borderLeft: `4px solid ${habit.color}` }}>
      <span className="text-2xl" aria-hidden>
        {habit.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{habit.name}</p>
        <p className="text-sm text-gray-500">
          {habit.type === 'check'
            ? completed
              ? '已完成'
              : '未完成'
            : `已記錄 ${formatAmount(todayTotal)}${habit.unit ?? ''}`}
        </p>
      </div>

      {habit.type === 'check' ? (
        <Button
          variant={completed ? 'secondary' : 'primary'}
          disabled={completed}
          onClick={() => onRecord(1)}
          aria-label={`補登 ${habit.name}`}
        >
          {completed ? '✓' : '打卡'}
        </Button>
      ) : (
        <Button onClick={onOpenEntry} aria-label={`補登 ${habit.name} 數量`} className="min-w-11">
          <Plus size={18} aria-hidden />
          {formatAmount(habit.step)}
        </Button>
      )}
    </Card>
  );
}
