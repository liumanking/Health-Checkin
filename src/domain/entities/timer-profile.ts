import { z } from 'zod';
import { idSchema, syncBaseSchema } from './base';

export const timerProfileSchema = syncBaseSchema.extend({
  id: idSchema,
  name: z.string().min(1),
  habitId: idSchema.optional(), // 綁定特定習慣 or global
  durationMin: z.number().positive(),
});

export type TimerProfile = z.infer<typeof timerProfileSchema>;
