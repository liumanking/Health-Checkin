import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TodayItem } from '@/application/queries/GetTodayListQuery';
import { useAppStore } from '@/app/useAppStore';
import { addDaysLocal, todayLocalDate } from '@/core/utils/date';
import { AmountEntrySheet } from '@/design-system/components/AmountEntrySheet';
import { Card } from '@/design-system/components/Card';
import { Skeleton } from '@/design-system/components/Skeleton';
import { useHistoryStore } from '../application/useHistoryStore';
import { HistoryHabitRow } from './HistoryHabitRow';

export function HistoryPage() {
  const navigate = useNavigate();
  const memberId = useAppStore((s) => s.memberId);
  const { date, items, loading, load, setDate, record } = useHistoryStore();
  const [entryItem, setEntryItem] = useState<TodayItem | null>(null);

  useEffect(() => {
    if (memberId) void load(memberId);
  }, [memberId, load]);

  const today = todayLocalDate();
  const isToday = date === today;

  const go = (delta: number) => {
    if (!memberId) return;
    const next = addDaysLocal(date, delta);
    if (next > today) return;
    void setDate(memberId, next);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-3 bg-gray-50 p-4">
      <header className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="返回"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 active:bg-gray-100"
        >
          <ArrowLeft size={22} aria-hidden />
        </button>
        <h1 className="text-xl font-bold text-gray-900">補登</h1>
      </header>

      <Card className="flex items-center justify-between gap-2 py-2">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="前一天"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 active:bg-gray-100"
        >
          <ChevronLeft size={20} aria-hidden />
        </button>
        <div className="flex flex-col items-center">
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => memberId && e.target.value && void setDate(memberId, e.target.value)}
            className="bg-transparent text-center text-sm font-medium text-gray-900 outline-none"
            aria-label="選擇日期"
          />
          <span className="text-xs text-gray-500">
            {format(new Date(`${date}T00:00:00`), 'M月d日 EEEE', { locale: zhTW })}
            {isToday && ' · 今天'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={isToday}
          aria-label="後一天"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 active:bg-gray-100 disabled:text-gray-300"
        >
          <ChevronRight size={20} aria-hidden />
        </button>
      </Card>

      {loading ? (
        <>
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-4xl" aria-hidden>
            🌱
          </p>
          <p className="font-medium text-gray-900">還沒有習慣</p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.habit.id}>
              <HistoryHabitRow
                item={item}
                onRecord={(amount) => memberId && void record(memberId, item.habit.id, amount)}
                onOpenEntry={() => setEntryItem(item)}
              />
            </li>
          ))}
        </ul>
      )}

      <AmountEntrySheet
        open={entryItem !== null}
        habitName={entryItem?.habit.name ?? ''}
        habitEmoji={entryItem?.habit.emoji ?? ''}
        unit={entryItem?.habit.unit}
        step={entryItem?.habit.step ?? 1}
        decimal={entryItem?.habit.decimal ?? false}
        onClose={() => setEntryItem(null)}
        onRecord={(amount) =>
          memberId && entryItem && void record(memberId, entryItem.habit.id, amount)
        }
      />
    </main>
  );
}
