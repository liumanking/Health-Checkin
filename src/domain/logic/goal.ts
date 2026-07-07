import type { Habit } from '@/domain/entities/habit';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly';

type HabitGoals = Pick<Habit, 'goalDaily' | 'goalWeekly' | 'goalMonthly'>;

export function goalFor(habit: HabitGoals, period: GoalPeriod): number | undefined {
  switch (period) {
    case 'daily':
      return habit.goalDaily;
    case 'weekly':
      return habit.goalWeekly;
    case 'monthly':
      return habit.goalMonthly;
  }
}

/** 該期間總量是否達標；未設目標視為未達標（無目標可判）。 */
export function checkGoal(habit: HabitGoals, period: GoalPeriod, total: number): boolean {
  const target = goalFor(habit, period);
  return target !== undefined && total >= target;
}

/** 目標進度 0..1；未設目標回傳 undefined。 */
export function goalProgress(
  habit: HabitGoals,
  period: GoalPeriod,
  total: number,
): number | undefined {
  const target = goalFor(habit, period);
  if (target === undefined || target <= 0) return undefined;
  return Math.min(1, total / target);
}
