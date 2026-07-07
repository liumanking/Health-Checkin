import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { categoryRepository } from '@/data/repositories/category-repository';
import { habitRepository } from '@/data/repositories/habit-repository';
import { idSchema } from '@/domain/entities/base';
import type { Habit } from '@/domain/entities/habit';

const inputSchema = z.object({
  habitId: idSchema,
  memberId: idSchema,
  /** 省略／undefined = 清除分類。 */
  categoryId: idSchema.optional(),
});

type Input = z.infer<typeof inputSchema>;

export const setHabitCategoryCommand: Command<Input, Habit> = {
  name: 'SetHabitCategory',
  input: inputSchema,

  async execute({ habitId, memberId, categoryId }) {
    const habit = await habitRepository.getById(habitId);
    if (!habit) throw new NotFoundError('habit', habitId);
    if (habit.memberId !== memberId) throw new ValidationError('習慣不屬於此成員');

    if (categoryId !== undefined) {
      const category = await categoryRepository.getById(categoryId);
      if (!category) throw new NotFoundError('category', categoryId);
      if (category.memberId !== memberId) throw new ValidationError('分類不屬於此成員');
    }

    const next: Habit = { ...habit, categoryId };
    await habitRepository.upsert(next);

    return {
      output: next,
      events: [makeEvent('TodayListChanged', 'app', { memberId })],
      audits: [
        {
          memberId,
          action: 'update',
          entity: 'habit',
          entityId: habitId,
          payload: { categoryId: categoryId ?? null },
        },
      ],
    };
  },
};
