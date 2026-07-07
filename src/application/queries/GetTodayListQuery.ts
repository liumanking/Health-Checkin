import type { Query } from '@/core/cqrs/query';
import { habitRepository } from '@/data/repositories/habit-repository';
import { logRepository } from '@/data/repositories/log-repository';
import type { Habit } from '@/domain/entities/habit';
import { calcDailyProgress, isCompleted } from '@/domain/logic/completion';

export interface TodayItem {
  habit: Habit;
  todayTotal: number;
  completed: boolean;
  progress: number; // 0..1
}

interface Input {
  memberId: string;
  date: string; // YYYY-MM-DD
}

/** 今日清單：未封存習慣 + 當日總量 + 完成判定。 */
export const getTodayListQuery: Query<Input, TodayItem[]> = {
  name: 'GetTodayList',

  async execute({ memberId, date }) {
    const [habits, logs] = await Promise.all([
      habitRepository.search({ memberId, archived: false }),
      logRepository.search({ memberId, dateFrom: date, dateTo: date }),
    ]);

    const totals = new Map<string, number>();
    for (const habit of habits) totals.set(habit.id, 0);
    for (const log of logs) {
      if (totals.has(log.habitId)) {
        totals.set(log.habitId, (totals.get(log.habitId) ?? 0) + log.amount);
      }
    }

    return habits.map((habit) => {
      const todayTotal = totals.get(habit.id) ?? 0;
      return {
        habit,
        todayTotal,
        completed: isCompleted(habit, todayTotal),
        progress: calcDailyProgress(habit, todayTotal),
      };
    });
  },
};
