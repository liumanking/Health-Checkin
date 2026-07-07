import type { TimerProfile } from '@/domain/entities/timer-profile';
import type { TimerSession } from '@/domain/entities/timer-session';
import type { TimerStatus } from '@/domain/entities/timer-session';
import type { BaseQuery } from '@/domain/queries/base-query';
import type { Repository } from './base-repo';

export interface TimerSessionQuery extends BaseQuery {
  habitId?: string;
  status?: TimerStatus;
}

export type TimerSessionRepository = Repository<TimerSession, TimerSessionQuery>;

export interface TimerProfileQuery {
  habitId?: string;
  includeDeleted?: boolean;
}

export type TimerProfileRepository = Repository<TimerProfile, TimerProfileQuery>;
