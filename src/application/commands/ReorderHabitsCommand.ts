import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { habitRepository } from '@/data/repositories/habit-repository';
import { idSchema } from '@/domain/entities/base';

const inputSchema = z.object({
  memberId: idSchema,
  /** 拖曳後的完整順序（該成員未封存習慣的 habitId 清單）。 */
  orderedHabitIds: z.array(idSchema).min(1),
});

type Input = z.infer<typeof inputSchema>;

/** 拖曳排序：依清單順序重寫每個習慣的 order 欄位。 */
export const reorderHabitsCommand: Command<Input, void> = {
  name: 'ReorderHabits',
  input: inputSchema,

  async execute({ memberId, orderedHabitIds }) {
    const habits = await habitRepository.search({ memberId });
    const byId = new Map(habits.map((h) => [h.id, h]));

    for (const id of orderedHabitIds) {
      if (!byId.has(id)) throw new ValidationError('清單包含不屬於此成員的習慣');
    }

    await Promise.all(
      orderedHabitIds.map((id, index) => {
        const habit = byId.get(id)!;
        if (habit.order === index) return Promise.resolve();
        return habitRepository.upsert({ ...habit, order: index });
      }),
    );

    return {
      output: undefined,
      events: [makeEvent('TodayListChanged', 'app', { memberId })],
      audits: [
        {
          memberId,
          action: 'update',
          entity: 'habit',
          entityId: 'bulk',
          payload: { reordered: orderedHabitIds },
        },
      ],
    };
  },
};
