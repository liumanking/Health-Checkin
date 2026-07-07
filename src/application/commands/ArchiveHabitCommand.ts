import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { habitRepository } from '@/data/repositories/habit-repository';
import { idSchema } from '@/domain/entities/base';
import type { Habit } from '@/domain/entities/habit';

const inputSchema = z.object({
  habitId: idSchema,
  memberId: idSchema,
  archived: z.boolean(),
});

type Input = z.infer<typeof inputSchema>;

/** 封存／取消封存：封存後不出現在 Today/Stats 等一般清單。 */
export const archiveHabitCommand: Command<Input, Habit> = {
  name: 'ArchiveHabit',
  input: inputSchema,

  async execute({ habitId, memberId, archived }) {
    const habit = await habitRepository.getById(habitId);
    if (!habit) throw new NotFoundError('habit', habitId);
    if (habit.memberId !== memberId) throw new ValidationError('習慣不屬於此成員');

    const next: Habit = { ...habit, archived };
    await habitRepository.upsert(next);

    return {
      output: next,
      events: [makeEvent('TodayListChanged', 'app', { memberId })],
      audits: [
        {
          memberId,
          action: archived ? 'archive' : 'unarchive',
          entity: 'habit',
          entityId: habitId,
          payload: { name: habit.name },
        },
      ],
    };
  },
};
