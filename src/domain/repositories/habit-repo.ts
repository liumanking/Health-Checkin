import type { Habit } from '@/domain/entities/habit';
import type { HabitQuery } from '@/domain/queries/habit-query';
import type { Repository } from './base-repo';

export type HabitRepository = Repository<Habit, HabitQuery>;
