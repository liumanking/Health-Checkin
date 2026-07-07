import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { nowIso } from '@/core/utils/date';
import { newId } from '@/core/utils/id';
import { categoryRepository } from '@/data/repositories/category-repository';
import { idSchema, newSyncBase } from '@/domain/entities/base';
import type { Category } from '@/domain/entities/category';

const inputSchema = z.object({
  memberId: idSchema,
  name: z.string().trim().min(1, '請輸入名稱'),
  color: z.string().min(1),
});

type Input = z.infer<typeof inputSchema>;

/** 新增分類：order 排在最後。 */
export const addCategoryCommand: Command<Input, Category> = {
  name: 'AddCategory',
  input: inputSchema,

  async execute({ memberId, name, color }) {
    const siblings = await categoryRepository.search({ memberId });
    const maxOrder = siblings.reduce((m, c) => Math.max(m, c.order), -1);

    const category: Category = {
      id: newId(),
      memberId,
      name,
      color,
      order: maxOrder + 1,
      ...newSyncBase(nowIso()),
    };
    await categoryRepository.upsert(category);

    return {
      output: category,
      audits: [
        {
          memberId,
          action: 'create',
          entity: 'category',
          entityId: category.id,
          payload: { name },
        },
      ],
    };
  },
};
