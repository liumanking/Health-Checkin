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

/** 復原剛刪除的習慣（E13：刪除後 Toast Undo）。 */
export const restoreHabitCommand: Command<Input, void> = {
  name: 'RestoreHabit',
  input: inputSchema,

  async execute({ habitId, memberId }) {
    const all = await habitRepository.search({ memberId, includeDeleted: true });
    const habit = all.find((h) => h.id === habitId);
    if (!habit) throw new NotFoundError('habit', habitId);
    if (habit.deletedAt === undefined) throw new ValidationError('這個習慣沒有被刪除');

    const { deletedAt: _deletedAt, ...restored } = habit;
    await habitRepository.upsert(restored);

    return {
      output: undefined,
      events: [makeEvent('TodayListChanged', 'app', { memberId })],
      audits: [
        {
          memberId,
          action: 'restore',
          entity: 'habit',
          entityId: habitId,
          payload: { name: habit.name },
        },
      ],
    };
  },
};
