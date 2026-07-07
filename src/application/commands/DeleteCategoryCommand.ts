import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { categoryRepository } from '@/data/repositories/category-repository';
import { habitRepository } from '@/data/repositories/habit-repository';
import { idSchema } from '@/domain/entities/base';

const inputSchema = z.object({
  categoryId: idSchema,
  memberId: idSchema,
});

type Input = z.infer<typeof inputSchema>;

/** 刪除分類：軟刪除分類本身，並清掉引用此分類的習慣的 categoryId。 */
export const deleteCategoryCommand: Command<Input, void> = {
  name: 'DeleteCategory',
  input: inputSchema,

  async execute({ categoryId, memberId }) {
    const category = await categoryRepository.getById(categoryId);
    if (!category) throw new NotFoundError('category', categoryId);
    if (category.memberId !== memberId) throw new ValidationError('分類不屬於此成員');

    await categoryRepository.softDelete(categoryId);

    const habits = await habitRepository.search({ memberId, categoryId });
    await Promise.all(
      habits.map((h) => habitRepository.upsert({ ...h, categoryId: undefined })),
    );

    return {
      output: undefined,
      events: [makeEvent('TodayListChanged', 'app', { memberId })],
      audits: [
        {
          memberId,
          action: 'delete',
          entity: 'category',
          entityId: categoryId,
          payload: { name: category.name, unassignedHabits: habits.length },
        },
      ],
    };
  },
};
