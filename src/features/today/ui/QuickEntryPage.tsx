import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { TodayItem } from '@/application/queries/GetTodayListQuery';
import { useAppStore } from '@/app/useAppStore';
import { AmountEntrySheet } from '@/design-system/components/AmountEntrySheet';
import { Card } from '@/design-system/components/Card';
import { Skeleton } from '@/design-system/components/Skeleton';
import { useTodayStore } from '../application/useTodayStore';
import { HabitCard } from './HabitCard';

/** PWA shortcut 目標：跳過其他 chrome，直接打卡（設計書 P6）。 */
export function QuickEntryPage() {
  const memberId = useAppStore((s) => s.memberId);
  const { items, loading, load, record } = useTodayStore();
  const [entryItem, setEntryItem] = useState<TodayItem | null>(null);

  useEffect(() => {
    if (memberId) void load(memberId);
  }, [memberId, load]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-3 bg-gray-50 p-4">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">快速記錄</h1>
          <p className="text-sm text-gray-500">{format(new Date(), 'M月d日 EEEE', { locale: zhTW })}</p>
        </div>
        <Link
          to="/"
          aria-label="前往完整清單"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
        >
          <ArrowRight size={22} aria-hidden />
        </Link>
      </header>

      {loading || memberId === null ? (
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
              <HabitCard
                item={item}
                onRecord={(amount) => void record(item.habit.id, amount)}
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
        onRecord={(amount) => entryItem && void record(entryItem.habit.id, amount)}
      />
    </main>
  );
}
