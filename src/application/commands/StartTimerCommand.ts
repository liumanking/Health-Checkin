import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { nowIso } from '@/core/utils/date';
import { newId } from '@/core/utils/id';
import { habitRepository } from '@/data/repositories/habit-repository';
import { timerSessionRepository } from '@/data/repositories/timer-repository';
import { idSchema, newSyncBase } from '@/domain/entities/base';
import type { TimerSession } from '@/domain/entities/timer-session';

const inputSchema = z.object({
  habitId: idSchema,
  memberId: idSchema,
  /** 帶入既有（paused）session id = 繼續計時；省略 = 全新開始。 */
  sessionId: idSchema.optional(),
});

type Input = z.infer<typeof inputSchema>;

/** 開始 / 繼續計時。 */
export const startTimerCommand: Command<Input, TimerSession> = {
  name: 'StartTimer',
  input: inputSchema,

  async execute({ habitId, memberId, sessionId }) {
    const habit = await habitRepository.getById(habitId);
    if (!habit) throw new NotFoundError('habit', habitId);
    if (habit.memberId !== memberId) throw new ValidationError('習慣不屬於此成員');
    if (habit.type !== 'timer') throw new ValidationError('此習慣不是計時類型');

    const now = nowIso();
    let session: TimerSession;

    if (sessionId) {
      const existing = await timerSessionRepository.getById(sessionId);
      if (!existing) throw new NotFoundError('timerSession', sessionId);
      if (existing.habitId !== habitId || existing.memberId !== memberId)
        throw new ValidationError('計時紀錄不屬於此習慣');
      if (existing.status !== 'paused') throw new ValidationError('只有暫停中的計時可以繼續');

      session = {
        ...existing,
        status: 'running',
        startedAt: now,
        updatedAt: now,
        syncVersion: existing.syncVersion + 1,
      };
    } else {
      session = {
        id: newId(),
        habitId,
        memberId,
        startedAt: now,
        accumulatedMs: 0,
        status: 'running',
        ...newSyncBase(now),
      };
    }

    await timerSessionRepository.upsert(session);

    return {
      output: session,
      events: [makeEvent('TimerUIUpdate', 'app', { sessionId: session.id })],
      audits: [
        {
          memberId,
          action: sessionId ? 'update' : 'create',
          entity: 'timer_session',
          entityId: session.id,
          payload: { habitId, status: session.status },
        },
      ],
    };
  },
};
