import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { nowIso } from '@/core/utils/date';
import { newId } from '@/core/utils/id';
import { memberRepository } from '@/data/repositories/misc-repositories';
import { newSyncBase } from '@/domain/entities/base';

const inputSchema = z.object({});

type Input = z.infer<typeof inputSchema>;

/**
 * 首次啟動建立預設成員（多成員為 Phase 2；P1 起所有資料掛在此成員下）。
 * 已存在成員時直接回傳第一位的 id。
 */
export const ensureDefaultMemberCommand: Command<Input, string> = {
  name: 'EnsureDefaultMember',
  input: inputSchema,

  async execute() {
    const existing = await memberRepository.search({});
    const first = existing[0];
    if (first) return { output: first.id };

    const member = { id: newId(), name: '我', ...newSyncBase(nowIso()) };
    await memberRepository.upsert(member);

    return {
      output: member.id,
      audits: [
        {
          memberId: member.id,
          action: 'create',
          entity: 'member',
          entityId: member.id,
          payload: { name: member.name },
        },
      ],
    };
  },
};
