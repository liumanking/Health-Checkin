import { useEffect } from 'react';
import { useAppStore } from '@/app/useAppStore';
import { Card } from '@/design-system/components/Card';
import { Input } from '@/design-system/components/Input';
import { Skeleton } from '@/design-system/components/Skeleton';
import type { StatsPeriod } from '@/application/queries/GetPeriodStatsQuery';
import { useStatsStore } from '../application/useStatsStore';
import { Heatmap } from './Heatmap';
import { TrendChart } from './TrendChart';

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'daily', label: '日' },
  { value: 'weekly', label: '週' },
  { value: 'monthly', label: '月' },
  { value: 'custom', label: '自訂' },
];

export function StatsPage() {
  const memberId = useAppStore((s) => s.memberId);
  const {
    habits,
    habitId,
    period,
    customFrom,
    customTo,
    cumulative,
    heatmap,
    points,
    loading,
    loadHabits,
    selectHabit,
    setPeriod,
    setCustomRange,
  } = useStatsStore();

  useEffect(() => {
    if (memberId) void loadHabits(memberId);
  }, [memberId, loadHabits]);

  const habit = habits.find((h) => h.id === habitId);

  if (!memberId || (loading && habits.length === 0)) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-3 p-4">
        <h1 className="pt-2 text-2xl font-bold text-gray-900">統計</h1>
        <Skeleton className="h-12" />
        <Skeleton className="h-24" />
        <Skeleton className="h-40" />
      </main>
    );
  }

  if (habits.length === 0) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-3 p-4">
        <h1 className="pt-2 text-2xl font-bold text-gray-900">統計</h1>
        <Card className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-4xl" aria-hidden>
            📊
          </p>
          <p className="font-medium text-gray-900">還沒有習慣可以看統計</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-3 p-4">
      <h1 className="pt-2 text-2xl font-bold text-gray-900">統計</h1>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist" aria-label="選擇習慣">
        {habits.map((h) => (
          <button
            key={h.id}
            type="button"
            role="tab"
            aria-selected={h.id === habitId}
            onClick={() => memberId && void selectHabit(h.id, memberId)}
            className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium ${
              h.id === habitId ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span aria-hidden>{h.emoji}</span>
            {h.name}
          </button>
        ))}
      </div>

      {loading || !habit ? (
        <>
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="flex flex-col items-center gap-1 py-4">
              <p className="text-2xl font-bold text-gray-900">
                {cumulative?.total ?? 0}
                {habit.unit && <span className="text-sm font-normal text-gray-500">{habit.unit}</span>}
              </p>
              <p className="text-xs text-gray-500">累計總量</p>
            </Card>
            <Card className="flex flex-col items-center gap-1 py-4">
              <p className="text-2xl font-bold text-gray-900">
                {cumulative?.streak ?? 0}
                <span className="text-sm font-normal text-gray-500">天</span>
              </p>
              <p className="text-xs text-gray-500">連續達成</p>
            </Card>
          </div>

          <Card className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700">完成熱力圖（近 91 天）</p>
            <Heatmap cells={heatmap} />
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">趨勢</p>
              <div className="flex gap-1 rounded-xl bg-gray-100 p-1" role="tablist" aria-label="時間區間">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="tab"
                    aria-selected={period === opt.value}
                    onClick={() => memberId && void setPeriod(opt.value, memberId)}
                    className={`min-h-8 rounded-lg px-2.5 text-xs font-medium ${
                      period === opt.value ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="從"
                  type="date"
                  value={customFrom}
                  max={customTo}
                  onChange={(e) => memberId && void setCustomRange(e.target.value, customTo, memberId)}
                />
                <Input
                  label="到"
                  type="date"
                  value={customTo}
                  min={customFrom}
                  onChange={(e) => memberId && void setCustomRange(customFrom, e.target.value, memberId)}
                />
              </div>
            )}

            <TrendChart points={points} color={habit.color} unit={habit.unit} />
          </Card>
        </>
      )}
    </main>
  );
}
