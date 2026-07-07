import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { newSyncBase, idSchema } from '@/domain/entities/base';
import { nowIso, todayLocalDate } from '@/core/utils/date';
import { newId } from '@/core/utils/id';
import { logRepository } from '@/data/repositories/log-repository';
import { timerSessionRepository } from '@/data/repositories/timer-repository';
import type { Log } from '@/domain/entities/log';
import type { TimerSession } from '@/domain/entities/timer-session';

const inputSchema = z.object({
  sessionId: idSchema,
  memberId: idSchema,
  /** 呼叫端（worker 當下 TICK 值）算出的最終累計時間。 */
  elapsedMs: z.number().nonnegative(),
});

type Input = z.infer<typeof inputSchema>;

interface Output {
  session: TimerSession;
  log: Log;
}

/** 停止計時＝完成：寫入 Log（分鐘，四捨五入，至少 1 分鐘）。 */
export const stopTimerCommand: Command<Input, Output> = {
  name: 'StopTimer',
  input: inputSchema,

  async execute({ sessionId, memberId, elapsedMs }) {
    const existing = await timerSessionRepository.getById(sessionId);
    if (!existing) throw new NotFoundError('timerSession', sessionId);
    if (existing.memberId !== memberId) throw new ValidationError('計時紀錄不屬於此成員');
    if (existing.status !== 'running' && existing.status !== 'paused')
      throw new ValidationError('這個計時已經結束');

    const now = nowIso();
    const minutes = Math.max(1, Math.round(elapsedMs / 60_000));

    const session: TimerSession = {
      ...existing,
      status: 'completed',
      accumulatedMs: elapsedMs,
      endedAt: now,
      updatedAt: now,
      syncVersion: existing.syncVersion + 1,
    };
    await timerSessionRepository.upsert(session);

    const log: Log = {
      id: newId(),
      habitId: existing.habitId,
      memberId,
      date: todayLocalDate(),
      amount: minutes,
      source: 'app',
      at: now,
      ...newSyncBase(now),
    };
    await logRepository.upsert(log);

    return {
      output: { session, log },
      events: [
        makeEvent('TimerCompleted', 'domain', {
          sessionId: session.id,
          habitId: session.habitId,
          memberId,
        }),
        makeEvent('HabitRecorded', 'domain', {
          habitId: session.habitId,
          logId: log.id,
          memberId,
          date: log.date,
        }),
        makeEvent('TodayListChanged', 'app', { memberId }),
      ],
      audits: [
        {
          memberId,
          action: 'update',
          entity: 'timer_session',
          entityId: session.id,
          payload: { status: 'completed', accumulatedMs: elapsedMs },
        },
        {
          memberId,
          action: 'create',
          entity: 'log',
          entityId: log.id,
          payload: { habitId: log.habitId, amount: log.amount, date: log.date, source: 'app' },
        },
      ],
    };
  },
};
