import type { Query } from '@/core/cqrs/query';
import { habitRepository } from '@/data/repositories/habit-repository';
import type { Habit } from '@/domain/entities/habit';

interface Input {
  habitId: string;
}

/** 單一習慣（editor 載入用；P3 起擴充統計欄位）。 */
export const getHabitDetailQuery: Query<Input, Habit | undefined> = {
  name: 'GetHabitDetail',

  async execute({ habitId }) {
    return habitRepository.getById(habitId);
  },
};
