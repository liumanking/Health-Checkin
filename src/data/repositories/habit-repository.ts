import { db } from '@/data/db/database';
import type { Habit } from '@/domain/entities/habit';
import type { HabitQuery } from '@/domain/queries/habit-query';
import type { HabitRepository } from '@/domain/repositories/habit-repo';
import { DexieRepository } from './dexie-repository';

class DexieHabitRepository extends DexieRepository<Habit, HabitQuery> implements HabitRepository {
  protected matches(h: Habit, q: HabitQuery): boolean {
    if (q.memberId !== undefined && h.memberId !== q.memberId) return false;
    if (q.archived !== undefined && h.archived !== q.archived) return false;
    if (q.categoryId !== undefined && h.categoryId !== q.categoryId) return false;
    if (q.type !== undefined && h.type !== q.type) return false;
    if (q.search !== undefined && !h.name.toLowerCase().includes(q.search.toLowerCase()))
      return false;
    return true;
  }

  protected override sort(items: Habit[]): Habit[] {
    return [...items].sort((a, b) => a.order - b.order);
  }
}

export const habitRepository: HabitRepository = new DexieHabitRepository(db.habits);
