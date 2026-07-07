import { db } from '@/data/db/database';
import { DbError } from '@/core/errors/app-error';
import type { HabitTag } from '@/domain/entities/tag';
import type { HabitTagRepository } from '@/domain/repositories/habit-tag-repo';

class DexieHabitTagRepository implements HabitTagRepository {
  async listAll(): Promise<HabitTag[]> {
    try {
      return await db.habitTags.toArray();
    } catch (e) {
      throw new DbError('listAll failed on habitTags', { cause: e });
    }
  }

  async listByHabit(habitId: string): Promise<HabitTag[]> {
    try {
      return await db.habitTags.where('habitId').equals(habitId).toArray();
    } catch (e) {
      throw new DbError('listByHabit failed on habitTags', { cause: e });
    }
  }

  async add(habitId: string, tagId: string): Promise<void> {
    try {
      await db.habitTags.put({ habitId, tagId });
    } catch (e) {
      throw new DbError('add failed on habitTags', { cause: e });
    }
  }

  async remove(habitId: string, tagId: string): Promise<void> {
    try {
      await db.habitTags.delete([habitId, tagId]);
    } catch (e) {
      throw new DbError('remove failed on habitTags', { cause: e });
    }
  }
}

export const habitTagRepository: HabitTagRepository = new DexieHabitTagRepository();
