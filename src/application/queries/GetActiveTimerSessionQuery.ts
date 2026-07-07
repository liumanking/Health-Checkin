import type { Query } from '@/core/cqrs/query';
import { timerSessionRepository } from '@/data/repositories/timer-repository';
import type { TimerSession } from '@/domain/entities/timer-session';

interface Input {
  habitId: string;
  memberId: string;
}

/** 這個習慣目前進行中／暫停中的計時（每個習慣同時只有一筆）。 */
export const getActiveTimerSessionQuery: Query<Input, TimerSession | undefined> = {
  name: 'GetActiveTimerSession',

  async execute({ habitId, memberId }) {
    const sessions = await timerSessionRepository.search({ habitId, memberId });
    return sessions.find((s) => s.status === 'running' || s.status === 'paused');
  },
};
