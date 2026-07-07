import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { History, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TodayItem } from '@/application/queries/GetTodayListQuery';
import { useAppStore } from '@/app/useAppStore';
import { InstallBanner } from '@/app/InstallBanner';
import { AmountEntrySheet } from '@/design-system/components/AmountEntrySheet';
import { Card } from '@/design-system/components/Card';
import { Skeleton } from '@/design-system/components/Skeleton';
import { useTodayStore } from '../application/useTodayStore';
import { HabitCard } from './HabitCard';

export function TodayPage() {
  const navigate = useNavigate();
  const memberId = useAppStore((s) => s.memberId);
  const { items, loading, load, record } = useTodayStore();
  const [entryItem, setEntryItem] = useState<TodayItem | null>(null);

  useEffect(() => {
    if (memberId) void load(memberId);
  }, [memberId, load]);

  const doneCount = items.filter((i) => i.completed).length;

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-3 p-4">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">今天</h1>
          <p className="text-sm text-gray-500">
            {format(new Date(), 'M月d日 EEEE', { locale: zhTW })}
            {items.length > 0 && ` · 完成 ${doneCount}/${items.length}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => navigate('/history')}
            aria-label="補登"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
          >
            <History size={22} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => navigate('/habit/new')}
            aria-label="新增習慣"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm active:bg-indigo-600"
          >
            <Plus size={22} aria-hidden />
          </button>
        </div>
      </header>

      <InstallBanner />

      {loading || memberId === null ? (
        <>
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-4xl" aria-hidden>
            🌱
          </p>
          <p className="font-medium text-gray-900">還沒有習慣</p>
          <p className="text-sm text-gray-500">點右上角 ＋ 建立第一個習慣，或從範本快速開始</p>
          <button
            type="button"
            onClick={() => navigate('/onboarding')}
            className="min-h-11 rounded-xl bg-indigo-50 px-4 text-sm font-medium text-indigo-600 active:bg-indigo-100"
          >
            從範本快速開始
          </button>
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
