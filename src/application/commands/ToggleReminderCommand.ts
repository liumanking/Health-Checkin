import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { habitRepository } from '@/data/repositories/habit-repository';
import { reminderRepository } from '@/data/repositories/reminder-repository';
import { idSchema } from '@/domain/entities/base';
import type { HabitReminder } from '@/domain/entities/reminder';

const inputSchema = z.object({
  reminderId: idSchema,
  memberId: idSchema,
  enabled: z.boolean(),
});

type Input = z.infer<typeof inputSchema>;

export const toggleReminderCommand: Command<Input, HabitReminder> = {
  name: 'ToggleReminder',
  input: inputSchema,

  async execute({ reminderId, memberId, enabled }) {
    const reminder = await reminderRepository.getById(reminderId);
    if (!reminder) throw new NotFoundError('reminder', reminderId);

    const habit = await habitRepository.getById(reminder.habitId);
    if (!habit || habit.memberId !== memberId) throw new ValidationError('提醒不屬於此成員');

    const next: HabitReminder = { ...reminder, enabled };
    await reminderRepository.upsert(next);

    return {
      output: next,
      audits: [
        {
          memberId,
          action: 'update',
          entity: 'reminder',
          entityId: reminderId,
          payload: { enabled },
        },
      ],
    };
  },
};
