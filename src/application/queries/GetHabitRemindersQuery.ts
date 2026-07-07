import type { Query } from '@/core/cqrs/query';
import { reminderRepository } from '@/data/repositories/reminder-repository';
import type { HabitReminder } from '@/domain/entities/reminder';

interface Input {
  habitId: string;
}

export const getHabitRemindersQuery: Query<Input, HabitReminder[]> = {
  name: 'GetHabitReminders',

  async execute({ habitId }) {
    return reminderRepository.search({ habitId });
  },
};
