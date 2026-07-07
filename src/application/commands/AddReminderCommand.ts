import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { nowIso } from '@/core/utils/date';
import { newId } from '@/core/utils/id';
import { habitRepository } from '@/data/repositories/habit-repository';
import { reminderRepository } from '@/data/repositories/reminder-repository';
import { idSchema, newSyncBase } from '@/domain/entities/base';
import type { HabitReminder } from '@/domain/entities/reminder';

const inputSchema = z.object({
  habitId: idSchema,
  memberId: idSchema,
  time: z.string().regex(/^\d{2}:\d{2}$/, '需為 HH:mm'),
});

type Input = z.infer<typeof inputSchema>;

/** 新增提醒時段（P5：rule 固定 daily，其餘規則留待後續）。 */
export const addReminderCommand: Command<Input, HabitReminder> = {
  name: 'AddReminder',
  input: inputSchema,

  async execute({ habitId, memberId, time }) {
    const habit = await habitRepository.getById(habitId);
    if (!habit) throw new NotFoundError('habit', habitId);
    if (habit.memberId !== memberId) throw new ValidationError('習慣不屬於此成員');

    const now = nowIso();
    const reminder: HabitReminder = {
      id: newId(),
      habitId,
      time,
      enabled: true,
      rule: 'daily',
      ...newSyncBase(now),
    };
    await reminderRepository.upsert(reminder);

    return {
      output: reminder,
      audits: [
        {
          memberId,
          action: 'create',
          entity: 'reminder',
          entityId: reminder.id,
          payload: { habitId, time },
        },
      ],
    };
  },
};
