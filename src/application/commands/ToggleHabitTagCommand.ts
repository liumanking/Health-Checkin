import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { habitRepository } from '@/data/repositories/habit-repository';
import { habitTagRepository } from '@/data/repositories/habit-tag-repository';
import { tagRepository } from '@/data/repositories/tag-repository';
import { idSchema } from '@/domain/entities/base';

const inputSchema = z.object({
  habitId: idSchema,
  memberId: idSchema,
  tagId: idSchema,
  on: z.boolean(),
});

type Input = z.infer<typeof inputSchema>;

/** 切換習慣的標籤（多對多關聯，整筆增刪，不走軟刪除）。 */
export const toggleHabitTagCommand: Command<Input, void> = {
  name: 'ToggleHabitTag',
  input: inputSchema,

  async execute({ habitId, memberId, tagId, on }) {
    const habit = await habitRepository.getById(habitId);
    if (!habit) throw new NotFoundError('habit', habitId);
    if (habit.memberId !== memberId) throw new ValidationError('習慣不屬於此成員');

    const tag = await tagRepository.getById(tagId);
    if (!tag) throw new NotFoundError('tag', tagId);
    if (tag.memberId !== memberId) throw new ValidationError('標籤不屬於此成員');

    if (on) await habitTagRepository.add(habitId, tagId);
    else await habitTagRepository.remove(habitId, tagId);

    return {
      output: undefined,
      audits: [
        {
          memberId,
          action: 'update',
          entity: 'habit_tag',
          entityId: `${habitId}:${tagId}`,
          payload: { on },
        },
      ],
    };
  },
};
