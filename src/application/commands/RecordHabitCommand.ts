import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { nowIso, todayLocalDate } from '@/core/utils/date';
import { newId } from '@/core/utils/id';
import { habitRepository } from '@/data/repositories/habit-repository';
import { logRepository } from '@/data/repositories/log-repository';
import { newSyncBase } from '@/domain/entities/base';
import { localDateSchema, logSourceSchema, type Log } from '@/domain/entities/log';
import { idSchema } from '@/domain/entities/base';

const inputSchema = z.object({
  habitId: idSchema,
  memberId: idSchema,
  amount: z.number().positive(),
  date: localDateSchema.optional(), // 省略 = 今天；補登（P4）帶過去日期
  source: logSourceSchema.optional(),
  note: z.string().optional(),
});

type Input = z.infer<typeof inputSchema>;

/** 打卡 / 計量記錄。 */
export const recordHabitCommand: Command<Input, Log> = {
  name: 'RecordHabit',
  input: inputSchema,

  async execute(input) {
    const habit = await habitRepository.getById(input.habitId);
    if (!habit) throw new NotFoundError('habit', input.habitId);
    if (habit.memberId !== input.memberId)
      throw new ValidationError('習慣不屬於此成員');
    if (!habit.decimal && !Number.isInteger(input.amount))
      throw new ValidationError('此習慣不允許小數量');

    const now = nowIso();
    const log: Log = {
      id: newId(),
      habitId: habit.id,
      memberId: input.memberId,
      date: input.date ?? todayLocalDate(),
      amount: input.amount,
      source: input.source ?? 'app',
      at: now,
      note: input.note,
      ...newSyncBase(now),
    };
    await logRepository.upsert(log);

    return {
      output: log,
      events: [
        makeEvent('HabitRecorded', 'domain', {
          habitId: habit.id,
          logId: log.id,
          memberId: input.memberId,
          date: log.date,
        }),
        makeEvent('TodayListChanged', 'app', { memberId: input.memberId }),
      ],
      audits: [
        {
          memberId: input.memberId,
          action: 'create',
          entity: 'log',
          entityId: log.id,
          payload: { habitId: habit.id, amount: log.amount, date: log.date, source: log.source },
        },
      ],
    };
  },
};
