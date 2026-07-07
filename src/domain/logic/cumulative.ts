import { addDaysLocal } from '@/core/utils/date';
import type { Log } from '@/domain/entities/log';

/** 重點累計：Log amount 全部加總。 */
export function calcCumulative(logs: ReadonlyArray<Pick<Log, 'amount'>>): number {
  return logs.reduce((sum, l) => sum + l.amount, 0);
}

/**
 * 連續天數：從 today（或 today 未完成時從昨天）往回數連續完成日。
 * @param completedDates 完成日集合（YYYY-MM-DD）
 */
export function calcStreak(completedDates: ReadonlySet<string>, today: string): number {
  let cursor = completedDates.has(today) ? today : addDaysLocal(today, -1);
  let streak = 0;
  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = addDaysLocal(cursor, -1);
  }
  return streak;
}
