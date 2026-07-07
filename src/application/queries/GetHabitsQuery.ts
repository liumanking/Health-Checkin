import type { Query } from '@/core/cqrs/query';
import { habitRepository } from '@/data/repositories/habit-repository';
import type { Habit } from '@/domain/entities/habit';

interface Input {
  memberId: string;
  archived?: boolean;
}

/** 依成員列出習慣（依 order 排序）。 */
export const getHabitsQuery: Query<Input, Habit[]> = {
  name: 'GetHabits',

  async execute({ memberId, archived }) {
    return habitRepository.search({ memberId, archived });
  },
};
