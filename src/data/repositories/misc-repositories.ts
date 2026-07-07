import { db } from '@/data/db/database';
import type { Category } from '@/domain/entities/category';
import type { Member } from '@/domain/entities/member';
import type { HabitReminder } from '@/domain/entities/reminder';
import type { Tag } from '@/domain/entities/tag';
import type { BaseQuery } from '@/domain/queries/base-query';
import type {
  CategoryRepository,
  MemberRepository,
  ReminderQuery,
  ReminderRepository,
  TagRepository,
} from '@/domain/repositories/misc-repos';
import { DexieRepository } from './dexie-repository';

class DexieMemberRepository extends DexieRepository<Member, BaseQuery> {
  protected matches(): boolean {
    return true;
  }
}

class DexieCategoryRepository extends DexieRepository<Category, BaseQuery> {
  protected matches(c: Category, q: BaseQuery): boolean {
    return q.memberId === undefined || c.memberId === q.memberId;
  }

  protected override sort(items: Category[]): Category[] {
    return [...items].sort((a, b) => a.order - b.order);
  }
}

class DexieTagRepository extends DexieRepository<Tag, BaseQuery> {
  protected matches(t: Tag, q: BaseQuery): boolean {
    return q.memberId === undefined || t.memberId === q.memberId;
  }
}

class DexieReminderRepository extends DexieRepository<HabitReminder, ReminderQuery> {
  protected matches(r: HabitReminder, q: ReminderQuery): boolean {
    if (q.habitId !== undefined && r.habitId !== q.habitId) return false;
    if (q.enabled !== undefined && r.enabled !== q.enabled) return false;
    return true;
  }
}

export const memberRepository: MemberRepository = new DexieMemberRepository(db.members);
export const categoryRepository: CategoryRepository = new DexieCategoryRepository(db.categories);
export const tagRepository: TagRepository = new DexieTagRepository(db.tags);
export const reminderRepository: ReminderRepository = new DexieReminderRepository(db.reminders);
