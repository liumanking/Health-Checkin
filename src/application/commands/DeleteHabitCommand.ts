import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { habitRepository } from '@/data/repositories/habit-repository';
import { idSchema } from '@/domain/entities/base';

const inputSchema = z.object({
  habitId: idSchema,
  memberId: idSchema,
});

type Input = z.infer<typeof inputSchema>;

/** 軟刪除習慣（鐵律 5）：設 deletedAt，查詢一律自動過濾。 */
export const deleteHabitCommand: Command<Input, void> = {
  name: 'DeleteHabit',
  input: inputSchema,

  async execute({ habitId, memberId }) {
    const habit = await habitRepository.getById(habitId);
    if (!habit) throw new NotFoundError('habit', habitId);
    if (habit.memberId !== memberId) throw new ValidationError('習慣不屬於此成員');

    await habitRepository.softDelete(habitId);

    return {
      output: undefined,
      events: [makeEvent('TodayListChanged', 'app', { memberId })],
      audits: [
        {
          memberId,
          action: 'delete',
          entity: 'habit',
          entityId: habitId,
          payload: { name: habit.name },
        },
      ],
    };
  },
};
