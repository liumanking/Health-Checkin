import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { habitTagRepository } from '@/data/repositories/habit-tag-repository';
import { tagRepository } from '@/data/repositories/tag-repository';
import { idSchema } from '@/domain/entities/base';

const inputSchema = z.object({
  tagId: idSchema,
  memberId: idSchema,
});

type Input = z.infer<typeof inputSchema>;

/** 刪除標籤：軟刪除標籤本身，並移除所有習慣對此標籤的關聯。 */
export const deleteTagCommand: Command<Input, void> = {
  name: 'DeleteTag',
  input: inputSchema,

  async execute({ tagId, memberId }) {
    const tag = await tagRepository.getById(tagId);
    if (!tag) throw new NotFoundError('tag', tagId);
    if (tag.memberId !== memberId) throw new ValidationError('標籤不屬於此成員');

    await tagRepository.softDelete(tagId);

    const links = await habitTagRepository.listAll();
    const affected = links.filter((l) => l.tagId === tagId);
    await Promise.all(affected.map((l) => habitTagRepository.remove(l.habitId, l.tagId)));

    return {
      output: undefined,
      audits: [
        {
          memberId,
          action: 'delete',
          entity: 'tag',
          entityId: tagId,
          payload: { name: tag.name, unlinked: affected.length },
        },
      ],
    };
  },
};
