import { create } from 'zustand';
import { ask } from '@/application/pipeline/queryPipeline';
import { getCumulativeQuery } from '@/application/queries/GetCumulativeQuery';
import { getHabitsQuery } from '@/application/queries/GetHabitsQuery';
import { getHeatmapQuery, type HeatmapCell } from '@/application/queries/GetHeatmapQuery';
import {
  getPeriodStatsQuery,
  type StatsPeriod,
  type StatsPoint,
} from '@/application/queries/GetPeriodStatsQuery';
import { todayLocalDate, addDaysLocal } from '@/core/utils/date';
import { showToast } from '@/design-system/components/Toast';
import type { Habit } from '@/domain/entities/habit';

interface StatsStore {
  habits: Habit[];
  habitId: string | null;
  period: StatsPeriod;
  customFrom: string;
  customTo: string;
  cumulative: { total: number; streak: number } | null;
  heatmap: HeatmapCell[];
  points: StatsPoint[];
  loading: boolean;

  loadHabits(memberId: string): Promise<void>;
  selectHabit(habitId: string, memberId: string): Promise<void>;
  setPeriod(period: StatsPeriod, memberId: string): Promise<void>;
  setCustomRange(from: string, to: string, memberId: string): Promise<void>;
}

async function loadStats(habitId: string, memberId: string, period: StatsPeriod, from: string, to: string) {
  const [cumulativeResult, heatmapResult, pointsResult] = await Promise.all([
    ask(getCumulativeQuery, { habitId, memberId }),
    ask(getHeatmapQuery, { habitId, memberId }),
    ask(getPeriodStatsQuery, { habitId, memberId, period, from, to }),
  ]);

  if (!cumulativeResult.ok || !heatmapResult.ok || !pointsResult.ok) {
    showToast('讀取統計失敗', 'error');
    return { cumulative: null, heatmap: [], points: [] };
  }
  return {
    cumulative: cumulativeResult.value,
    heatmap: heatmapResult.value.days,
    points: pointsResult.value.points,
  };
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  habits: [],
  habitId: null,
  period: 'daily',
  customFrom: addDaysLocal(todayLocalDate(), -13),
  customTo: todayLocalDate(),
  cumulative: null,
  heatmap: [],
  points: [],
  loading: true,

  async loadHabits(memberId) {
    set({ loading: true });
    const result = await ask(getHabitsQuery, { memberId, archived: false });
    const habits = result.ok ? result.value : [];
    const habitId = get().habitId ?? habits[0]?.id ?? null;
    set({ habits, habitId });
    if (habitId) await get().selectHabit(habitId, memberId);
    else set({ loading: false });
  },

  async selectHabit(habitId, memberId) {
    set({ loading: true, habitId });
    const { period, customFrom, customTo } = get();
    const result = await loadStats(habitId, memberId, period, customFrom, customTo);
    set({ ...result, loading: false });
  },

  async setPeriod(period, memberId) {
    const { habitId, customFrom, customTo } = get();
    if (!habitId) return;
    set({ loading: true, period });
    const result = await loadStats(habitId, memberId, period, customFrom, customTo);
    set({ ...result, loading: false });
  },

  async setCustomRange(from, to, memberId) {
    const { habitId } = get();
    if (!habitId) return;
    set({ loading: true, customFrom: from, customTo: to });
    const result = await loadStats(habitId, memberId, 'custom', from, to);
    set({ ...result, loading: false });
  },
}));
