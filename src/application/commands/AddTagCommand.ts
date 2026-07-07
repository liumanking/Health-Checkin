import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { nowIso } from '@/core/utils/date';
import { newId } from '@/core/utils/id';
import { tagRepository } from '@/data/repositories/tag-repository';
import { idSchema, newSyncBase } from '@/domain/entities/base';
import type { Tag } from '@/domain/entities/tag';

const inputSchema = z.object({
  memberId: idSchema,
  name: z.string().trim().min(1, '請輸入名稱'),
});

type Input = z.infer<typeof inputSchema>;

export const addTagCommand: Command<Input, Tag> = {
  name: 'AddTag',
  input: inputSchema,

  async execute({ memberId, name }) {
    const tag: Tag = {
      id: newId(),
      memberId,
      name,
      ...newSyncBase(nowIso()),
    };
    await tagRepository.upsert(tag);

    return {
      output: tag,
      audits: [
        {
          memberId,
          action: 'create',
          entity: 'tag',
          entityId: tag.id,
          payload: { name },
        },
      ],
    };
  },
};
