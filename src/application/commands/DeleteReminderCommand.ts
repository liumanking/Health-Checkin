import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { habitRepository } from '@/data/repositories/habit-repository';
import { reminderRepository } from '@/data/repositories/reminder-repository';
import { idSchema } from '@/domain/entities/base';

const inputSchema = z.object({
  reminderId: idSchema,
  memberId: idSchema,
});

type Input = z.infer<typeof inputSchema>;

export const deleteReminderCommand: Command<Input, void> = {
  name: 'DeleteReminder',
  input: inputSchema,

  async execute({ reminderId, memberId }) {
    const reminder = await reminderRepository.getById(reminderId);
    if (!reminder) throw new NotFoundError('reminder', reminderId);

    const habit = await habitRepository.getById(reminder.habitId);
    if (!habit || habit.memberId !== memberId) throw new ValidationError('提醒不屬於此成員');

    await reminderRepository.softDelete(reminderId);

    return {
      output: undefined,
      audits: [
        {
          memberId,
          action: 'delete',
          entity: 'reminder',
          entityId: reminderId,
          payload: { habitId: reminder.habitId, time: reminder.time },
        },
      ],
    };
  },
};
