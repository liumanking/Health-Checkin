import { Pencil, Play, Plus } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TodayItem } from '@/application/queries/GetTodayListQuery';
import { isEnabled } from '@/core/feature-flags/flags';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';

interface Props {
  item: TodayItem;
  onRecord: (amount: number) => void;
  onOpenEntry: () => void; // 計量自訂數量輸入
}

function formatAmount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function HabitCard({ item, onRecord, onOpenEntry }: Props) {
  const navigate = useNavigate();
  const { habit, todayTotal, completed, progress } = item;

  const progressLabel =
    habit.type === 'check'
      ? completed
        ? '今日已完成'
        : '今日未打卡'
      : `今日 ${formatAmount(todayTotal)}${habit.unit ?? ''}${
          habit.goalDaily ? ` / ${formatAmount(habit.goalDaily)}${habit.unit ?? ''}` : ''
        }`;

  return (
    <Card className="flex items-center gap-3" style={{ borderLeft: `4px solid ${habit.color}` }}>
      <span className="text-2xl" aria-hidden>
        {habit.emoji}
      </span>

      {/* 計量：點卡片本體輸入自訂數量 */}
      <div
        className="min-w-0 flex-1"
        {...(habit.type === 'count'
          ? {
              role: 'button' as const,
              tabIndex: 0,
              'aria-label': `輸入 ${habit.name} 數量`,
              onClick: onOpenEntry,
              onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
                if (e.key === 'Enter' || e.key === ' ') onOpenEntry();
              },
            }
          : {})}
      >
        <div className="flex items-center gap-1.5">
          <p className="truncate font-medium text-gray-900">{habit.name}</p>
          {habit.schedule === 'anytime' && (
            <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
              隨時
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {completed && habit.type !== 'check' ? '✅ ' : ''}
          {progressLabel}
        </p>
        {habit.goalDaily !== undefined && (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress * 100}%`, backgroundColor: habit.color }}
            />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {habit.type === 'check' && (
          <Button
            variant={completed ? 'secondary' : 'primary'}
            disabled={completed}
            onClick={() => onRecord(1)}
            aria-label={`打卡 ${habit.name}`}
          >
            {completed ? '✓' : '打卡'}
          </Button>
        )}

        {habit.type === 'count' && (
          <Button
            onClick={() => onRecord(habit.step)}
            aria-label={`記錄 ${habit.name} ${formatAmount(habit.step)}${habit.unit ?? ''}`}
            className="min-w-11"
          >
            <Plus size={18} aria-hidden />
            {formatAmount(habit.step)}
          </Button>
        )}

        {habit.type === 'timer' && (
          <Button
            variant="secondary"
            disabled={!isEnabled('timer')}
            aria-label={`計時 ${habit.name}`}
            onClick={() => navigate(`/timer/${habit.id}`)}
          >
            <Play size={18} aria-hidden />
          </Button>
        )}

        <button
          type="button"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-400 active:bg-gray-100"
          aria-label={`編輯 ${habit.name}`}
          onClick={() => navigate(`/habit/${habit.id}/edit`)}
        >
          <Pencil size={18} aria-hidden />
        </button>
      </div>
    </Card>
  );
}
