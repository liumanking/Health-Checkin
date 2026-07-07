import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { nowIso } from '@/core/utils/date';
import { timerSessionRepository } from '@/data/repositories/timer-repository';
import { idSchema } from '@/domain/entities/base';
import type { TimerSession } from '@/domain/entities/timer-session';

const inputSchema = z.object({
  sessionId: idSchema,
  memberId: idSchema,
});

type Input = z.infer<typeof inputSchema>;

/** 捨棄計時：不寫 Log，純粹結束這次 session。 */
export const cancelTimerCommand: Command<Input, TimerSession> = {
  name: 'CancelTimer',
  input: inputSchema,

  async execute({ sessionId, memberId }) {
    const existing = await timerSessionRepository.getById(sessionId);
    if (!existing) throw new NotFoundError('timerSession', sessionId);
    if (existing.memberId !== memberId) throw new ValidationError('計時紀錄不屬於此成員');
    if (existing.status !== 'running' && existing.status !== 'paused')
      throw new ValidationError('這個計時已經結束');

    const now = nowIso();
    const session: TimerSession = {
      ...existing,
      status: 'cancelled',
      endedAt: now,
      updatedAt: now,
      syncVersion: existing.syncVersion + 1,
    };
    await timerSessionRepository.upsert(session);

    return {
      output: session,
      events: [makeEvent('TimerUIUpdate', 'app', { sessionId: session.id })],
      audits: [
        {
          memberId,
          action: 'update',
          entity: 'timer_session',
          entityId: session.id,
          payload: { status: 'cancelled' },
        },
      ],
    };
  },
};
