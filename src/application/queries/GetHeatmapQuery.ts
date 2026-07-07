import type { Query } from '@/core/cqrs/query';
import { NotFoundError } from '@/core/errors/app-error';
import { addDaysLocal, todayLocalDate } from '@/core/utils/date';
import { habitRepository } from '@/data/repositories/habit-repository';
import { logRepository } from '@/data/repositories/log-repository';
import { calcDailyProgress, isCompleted } from '@/domain/logic/completion';

interface Input {
  habitId: string;
  memberId: string;
  /** 預設 91 天（約 13 週，GitHub 風格熱力圖）。 */
  days?: number;
}

export interface HeatmapCell {
  date: string;
  total: number;
  completed: boolean;
  /** 0 沒記錄／1 未達標有記錄／2 達標／3 超額達標（>=1.5x 日目標）。 */
  level: 0 | 1 | 2 | 3;
}

interface Output {
  days: HeatmapCell[];
}

/** 熱力圖資料：過去 N 天每天的完成強度。 */
export const getHeatmapQuery: Query<Input, Output> = {
  name: 'GetHeatmap',

  async execute({ habitId, memberId, days = 91 }) {
    const habit = await habitRepository.getById(habitId);
    if (!habit) throw new NotFoundError('habit', habitId);

    const today = todayLocalDate();
    const from = addDaysLocal(today, -(days - 1));
    const logs = await logRepository.search({ habitId, memberId, dateFrom: from, dateTo: today });

    const totals = new Map<string, number>();
    for (const log of logs) totals.set(log.date, (totals.get(log.date) ?? 0) + log.amount);

    const cells: HeatmapCell[] = [];
    for (let i = 0; i < days; i++) {
      const date = addDaysLocal(from, i);
      const total = totals.get(date) ?? 0;
      const completed = isCompleted(habit, total);
      const progress = calcDailyProgress(habit, total);

      let level: HeatmapCell['level'] = 0;
      if (progress > 0 && progress < 1) level = 1;
      else if (progress >= 1) {
        level = habit.goalDaily !== undefined && total >= habit.goalDaily * 1.5 ? 3 : 2;
      }

      cells.push({ date, total, completed, level });
    }

    return { days: cells };
  },
};
