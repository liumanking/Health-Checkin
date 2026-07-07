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
  /** 呼叫端（worker 當下 TICK 值）算出的已累計時間。 */
  elapsedMs: z.number().nonnegative(),
});

type Input = z.infer<typeof inputSchema>;

/** 暫停計時：凍結 accumulatedMs，worker 由呼叫端釋放。 */
export const pauseTimerCommand: Command<Input, TimerSession> = {
  name: 'PauseTimer',
  input: inputSchema,

  async execute({ sessionId, memberId, elapsedMs }) {
    const existing = await timerSessionRepository.getById(sessionId);
    if (!existing) throw new NotFoundError('timerSession', sessionId);
    if (existing.memberId !== memberId) throw new ValidationError('計時紀錄不屬於此成員');
    if (existing.status !== 'running') throw new ValidationError('只有計時中可以暫停');

    const now = nowIso();
    const session: TimerSession = {
      ...existing,
      status: 'paused',
      accumulatedMs: elapsedMs,
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
          payload: { status: 'paused', accumulatedMs: elapsedMs },
        },
      ],
    };
  },
};
