import type { HabitReminder } from '@/domain/entities/reminder';
import type { ReminderQuery } from '@/domain/queries/reminder-query';
import type { Repository } from './base-repo';

export type ReminderRepository = Repository<HabitReminder, ReminderQuery>;
