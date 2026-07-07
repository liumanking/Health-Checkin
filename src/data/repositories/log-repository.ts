import { db } from '@/data/db/database';
import type { Log } from '@/domain/entities/log';
import type { LogQuery } from '@/domain/queries/log-query';
import type { LogRepository } from '@/domain/repositories/log-repo';
import { DexieRepository } from './dexie-repository';

class DexieLogRepository extends DexieRepository<Log, LogQuery> implements LogRepository {
  protected matches(l: Log, q: LogQuery): boolean {
    if (q.memberId !== undefined && l.memberId !== q.memberId) return false;
    if (q.habitId !== undefined && l.habitId !== q.habitId) return false;
    if (q.dateFrom !== undefined && l.date < q.dateFrom) return false;
    if (q.dateTo !== undefined && l.date > q.dateTo) return false;
    if (q.source !== undefined && l.source !== q.source) return false;
    return true;
  }

  protected override sort(items: Log[]): Log[] {
    return [...items].sort((a, b) => (a.date === b.date ? (a.at < b.at ? -1 : 1) : a.date < b.date ? -1 : 1));
  }
}

export const logRepository: LogRepository = new DexieLogRepository(db.logs);
