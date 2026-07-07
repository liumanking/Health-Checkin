import type { Habit } from '@/domain/entities/habit';
import type { Log } from '@/domain/entities/log';

type HabitGoal = Pick<Habit, 'type' | 'goalDaily'>;

/** 當日各筆 Log 的 amount 加總。 */
export function calcDailyTotal(logs: ReadonlyArray<Pick<Log, 'amount'>>): number {
  return logs.reduce((sum, l) => sum + l.amount, 0);
}

/**
 * 完成判定：
 * - check：達 goalDaily（未設則 1 次）即完成
 * - count / timer：設 goalDaily 則達標完成；未設則有記錄（>0）即完成
 */
export function isCompleted(habit: HabitGoal, dailyTotal: number): boolean {
  const target = habit.goalDaily ?? (habit.type === 'check' ? 1 : undefined);
  if (target !== undefined) return dailyTotal >= target;
  return dailyTotal > 0;
}

/** 當日進度 0..1（無日目標時：有記錄即 1）。 */
export function calcDailyProgress(habit: HabitGoal, dailyTotal: number): number {
  const target = habit.goalDaily ?? (habit.type === 'check' ? 1 : undefined);
  if (target === undefined) return dailyTotal > 0 ? 1 : 0;
  if (target <= 0) return 0;
  return Math.min(1, dailyTotal / target);
}
