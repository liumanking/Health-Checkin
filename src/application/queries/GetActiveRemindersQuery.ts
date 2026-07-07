import type { Query } from '@/core/cqrs/query';
import { habitRepository } from '@/data/repositories/habit-repository';
import { reminderRepository } from '@/data/repositories/reminder-repository';
import type { Habit } from '@/domain/entities/habit';
import type { HabitReminder } from '@/domain/entities/reminder';

interface Input {
  memberId: string;
}

export interface ActiveReminder {
  reminder: HabitReminder;
  habit: Habit;
}

/** 該成員所有已啟用、且習慣未封存的提醒（提醒排程器用）。 */
export const getActiveRemindersQuery: Query<Input, ActiveReminder[]> = {
  name: 'GetActiveReminders',

  async execute({ memberId }) {
    const habits = await habitRepository.search({ memberId, archived: false });
    const habitById = new Map(habits.map((h) => [h.id, h]));

    const reminders = await reminderRepository.search({});
    const result: ActiveReminder[] = [];
    for (const reminder of reminders) {
      if (!reminder.enabled) continue;
      const habit = habitById.get(reminder.habitId);
      if (!habit) continue;
      result.push({ reminder, habit });
    }
    return result;
  },
};
