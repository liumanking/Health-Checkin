import type { LogSource } from '@/domain/entities/log';

/** LogQuery specification：含日期範圍（YYYY-MM-DD，含端點）。 */
export interface LogQuery {
  memberId?: string;
  habitId?: string;
  dateFrom?: string;
  dateTo?: string;
  source?: LogSource;
  includeDeleted?: boolean;
}
