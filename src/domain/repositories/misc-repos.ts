import type { Category } from '@/domain/entities/category';
import type { Member } from '@/domain/entities/member';
import type { HabitReminder } from '@/domain/entities/reminder';
import type { Tag } from '@/domain/entities/tag';
import type { BaseQuery } from '@/domain/queries/base-query';
import type { Repository } from './base-repo';

export type MemberRepository = Repository<Member, BaseQuery>;
export type CategoryRepository = Repository<Category, BaseQuery>;
export type TagRepository = Repository<Tag, BaseQuery>;

export interface ReminderQuery {
  habitId?: string;
  enabled?: boolean;
  includeDeleted?: boolean;
}
export type ReminderRepository = Repository<HabitReminder, ReminderQuery>;
