import type { Query } from '@/core/cqrs/query';
import { habitTagRepository } from '@/data/repositories/habit-tag-repository';
import type { HabitTag } from '@/domain/entities/tag';

/** 全表讀取（P0 資料量小），由呼叫端依 habitId 分組。 */
export const getHabitTagsQuery: Query<void, HabitTag[]> = {
  name: 'GetHabitTags',

  async execute() {
    return habitTagRepository.listAll();
  },
};
