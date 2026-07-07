import type { Query } from '@/core/cqrs/query';
import { NotFoundError } from '@/core/errors/app-error';
import { todayLocalDate } from '@/core/utils/date';
import { habitRepository } from '@/data/repositories/habit-repository';
import { logRepository } from '@/data/repositories/log-repository';
import { isCompleted } from '@/domain/logic/completion';
import { calcCumulative, calcStreak } from '@/domain/logic/cumulative';

interface Input {
  habitId: string;
  memberId: string;
}

interface Output {
  total: number;
  streak: number;
}

/** 累計卡片：全部歷史加總 + 目前連續天數。 */
export const getCumulativeQuery: Query<Input, Output> = {
  name: 'GetCumulative',

  async execute({ habitId, memberId }) {
    const habit = await habitRepository.getById(habitId);
    if (!habit) throw new NotFoundError('habit', habitId);

    const logs = await logRepository.search({ habitId, memberId });
    const total = calcCumulative(logs);

    const dailyTotals = new Map<string, number>();
    for (const log of logs) {
      dailyTotals.set(log.date, (dailyTotals.get(log.date) ?? 0) + log.amount);
    }
    const completedDates = new Set<string>();
    for (const [date, amount] of dailyTotals) {
      if (isCompleted(habit, amount)) completedDates.add(date);
    }
    const streak = calcStreak(completedDates, todayLocalDate());

    return { total, streak };
  },
};
