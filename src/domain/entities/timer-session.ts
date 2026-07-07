import { z } from 'zod';
import { idSchema, syncBaseSchema } from './base';

export const timerStatusSchema = z.enum(['running', 'paused', 'completed', 'cancelled']);
export type TimerStatus = z.infer<typeof timerStatusSchema>;

export const timerSessionSchema = syncBaseSchema.extend({
  id: idSchema,
  habitId: idSchema,
  memberId: idSchema,
  profileId: idSchema.optional(),
  startedAt: z.string(),
  endedAt: z.string().optional(),
  accumulatedMs: z.number().nonnegative(),
  status: timerStatusSchema,
});

export type TimerSession = z.infer<typeof timerSessionSchema>;
