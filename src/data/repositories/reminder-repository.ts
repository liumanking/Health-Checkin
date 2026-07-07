import { db } from '@/data/db/database';
import type { HabitReminder } from '@/domain/entities/reminder';
import type { ReminderQuery } from '@/domain/queries/reminder-query';
import type { ReminderRepository } from '@/domain/repositories/reminder-repo';
import { DexieRepository } from './dexie-repository';

class DexieReminderRepository
  extends DexieRepository<HabitReminder, ReminderQuery>
  implements ReminderRepository
{
  protected matches(r: HabitReminder, q: ReminderQuery): boolean {
    if (q.habitId !== undefined && r.habitId !== q.habitId) return false;
    return true;
  }

  protected override sort(items: HabitReminder[]): HabitReminder[] {
    return [...items].sort((a, b) => a.time.localeCompare(b.time));
  }
}

export const reminderRepository: ReminderRepository = new DexieReminderRepository(db.reminders);
