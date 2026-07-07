import { z } from 'zod';
import { idSchema, syncBaseSchema } from './base';

export const reminderRuleSchema = z.enum(['daily', 'weekdays', 'weekends', 'monthly', 'custom']);
export type ReminderRule = z.infer<typeof reminderRuleSchema>;

export const habitReminderSchema = syncBaseSchema.extend({
  id: idSchema,
  habitId: idSchema,
  time: z.string().regex(/^\d{2}:\d{2}$/, '需為 HH:mm'),
  enabled: z.boolean(),
  rule: reminderRuleSchema, // 預設 'daily'，UI 暫只做 daily
});

export type HabitReminder = z.infer<typeof habitReminderSchema>;
