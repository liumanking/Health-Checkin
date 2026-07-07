import { addMonths, addWeeks, endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import type { Query } from '@/core/cqrs/query';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { addDaysLocal, todayLocalDate } from '@/core/utils/date';
import { habitRepository } from '@/data/repositories/habit-repository';
import { logRepository } from '@/data/repositories/log-repository';
import { checkGoal } from '@/domain/logic/goal';

export type StatsPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

interface Input {
  habitId: string;
  memberId: string;
  period: StatsPeriod;
  /** period 'custom' 時必填（YYYY-MM-DD，含端點）。 */
  from?: string;
  to?: string;
}

export interface StatsPoint {
  periodKey: string;
  label: string;
  total: number;
  completed: boolean;
}

interface Output {
  points: StatsPoint[];
  total: number;
}

const DAILY_WINDOW = 14;
const WEEKLY_WINDOW = 8;
const MONTHLY_WINDOW = 6;
const CUSTOM_MAX_DAYS = 366;

function toDate(local: string): Date {
  return new Date(`${local}T00:00:00`);
}

interface Bucket {
  key: string;
  label: string;
  from: string;
  to: string;
}

function buildBuckets(period: StatsPeriod, today: string, from?: string, to?: string): Bucket[] {
  if (period === 'daily') {
    const start = addDaysLocal(today, -(DAILY_WINDOW - 1));
    return Array.from({ length: DAILY_WINDOW }, (_, i) => {
      const date = addDaysLocal(start, i);
      return { key: date, label: format(toDate(date), 'M/d'), from: date, to: date };
    });
  }

  if (period === 'weekly') {
    const anchor = startOfWeek(toDate(addDaysLocal(today, -7 * (WEEKLY_WINDOW - 1))), {
      weekStartsOn: 1,
    });
    return Array.from({ length: WEEKLY_WINDOW }, (_, i) => {
      const weekStart = addWeeks(anchor, i);
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return {
        key: format(weekStart, 'yyyy-MM-dd'),
        label: format(weekStart, 'M/d'),
        from: format(weekStart, 'yyyy-MM-dd'),
        to: format(weekEnd, 'yyyy-MM-dd'),
      };
    });
  }

  if (period === 'monthly') {
    const anchor = startOfMonth(addMonths(toDate(today), -(MONTHLY_WINDOW - 1)));
    return Array.from({ length: MONTHLY_WINDOW }, (_, i) => {
      const monthStart = addMonths(anchor, i);
      const monthEnd = endOfMonth(monthStart);
      return {
        key: format(monthStart, 'yyyy-MM'),
        label: format(monthStart, 'M月'),
        from: format(monthStart, 'yyyy-MM-dd'),
        to: format(monthEnd, 'yyyy-MM-dd'),
      };
    });
  }

  if (!from || !to) throw new ValidationError('自訂範圍需要 from/to');
  if (from > to) throw new ValidationError('起始日期需早於結束日期');

  const buckets: Bucket[] = [];
  let cursor = from;
  for (let i = 0; i < CUSTOM_MAX_DAYS && cursor <= to; i++) {
    buckets.push({ key: cursor, label: format(toDate(cursor), 'M/d'), from: cursor, to: cursor });
    cursor = addDaysLocal(cursor, 1);
  }
  return buckets;
}

/** 多時段趨勢資料：日/週/月/自訂範圍，各期一個資料點。 */
export const getPeriodStatsQuery: Query<Input, Output> = {
  name: 'GetPeriodStats',

  async execute({ habitId, memberId, period, from, to }) {
    const habit = await habitRepository.getById(habitId);
    if (!habit) throw new NotFoundError('habit', habitId);

    const today = todayLocalDate();
    const buckets = buildBuckets(period, today, from, to);
    if (buckets.length === 0) return { points: [], total: 0 };

    const rangeFrom = buckets[0].from;
    const rangeTo = buckets[buckets.length - 1].to;
    const logs = await logRepository.search({
      habitId,
      memberId,
      dateFrom: rangeFrom,
      dateTo: rangeTo,
    });

    const goalPeriod = period === 'weekly' ? 'weekly' : period === 'monthly' ? 'monthly' : 'daily';

    const points: StatsPoint[] = buckets.map((b) => {
      const total = logs
        .filter((l) => l.date >= b.from && l.date <= b.to)
        .reduce((sum, l) => sum + l.amount, 0);
      return {
        periodKey: b.key,
        label: b.label,
        total,
        completed: checkGoal(habit, goalPeriod, total),
      };
    });

    return { points, total: points.reduce((sum, p) => sum + p.total, 0) };
  },
};
