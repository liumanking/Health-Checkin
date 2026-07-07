import { db } from '@/data/db/database';
import type { TimerProfile } from '@/domain/entities/timer-profile';
import type { TimerSession } from '@/domain/entities/timer-session';
import type {
  TimerProfileQuery,
  TimerProfileRepository,
  TimerSessionQuery,
  TimerSessionRepository,
} from '@/domain/repositories/timer-repo';
import { DexieRepository } from './dexie-repository';

class DexieTimerSessionRepository
  extends DexieRepository<TimerSession, TimerSessionQuery>
  implements TimerSessionRepository
{
  protected matches(s: TimerSession, q: TimerSessionQuery): boolean {
    if (q.memberId !== undefined && s.memberId !== q.memberId) return false;
    if (q.habitId !== undefined && s.habitId !== q.habitId) return false;
    if (q.status !== undefined && s.status !== q.status) return false;
    return true;
  }
}

class DexieTimerProfileRepository
  extends DexieRepository<TimerProfile, TimerProfileQuery>
  implements TimerProfileRepository
{
  protected matches(p: TimerProfile, q: TimerProfileQuery): boolean {
    if (q.habitId !== undefined && p.habitId !== q.habitId) return false;
    return true;
  }
}

export const timerSessionRepository: TimerSessionRepository = new DexieTimerSessionRepository(
  db.timerSessions,
);
export const timerProfileRepository: TimerProfileRepository = new DexieTimerProfileRepository(
  db.timerProfiles,
);
