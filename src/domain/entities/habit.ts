import { z } from 'zod';
import { idSchema, syncBaseSchema } from './base';

export const habitTypeSchema = z.enum(['check', 'count', 'timer']);
export type HabitType = z.infer<typeof habitTypeSchema>;

export const scheduleSchema = z.enum(['daily', 'anytime']);
export type Schedule = z.infer<typeof scheduleSchema>;

export const habitSchema = syncBaseSchema.extend({
  id: idSchema,
  memberId: idSchema,
  name: z.string().min(1),
  emoji: z.string(),
  color: z.string(),
  order: z.number(),
  archived: z.boolean(),
  type: habitTypeSchema,
  unit: z.string().optional(), // count/timer 的單位（次、分鐘、公里…）
  decimal: z.boolean(),
  step: z.number().positive(),
  schedule: scheduleSchema,
  goalDaily: z.number().positive().optional(),
  goalWeekly: z.number().positive().optional(),
  goalMonthly: z.number().positive().optional(),
  categoryId: idSchema.optional(),
});

export type Habit = z.infer<typeof habitSchema>;
