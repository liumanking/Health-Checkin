import { z } from 'zod';
import { idSchema } from './base';
import { habitTypeSchema } from './habit';

/** 首次使用的習慣範本（內建資料，無 SyncBase）。 */
export const habitTemplateSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  emoji: z.string(),
  color: z.string(),
  type: habitTypeSchema,
  unit: z.string().optional(),
  decimal: z.boolean(),
  step: z.number().positive(),
  goalDaily: z.number().positive().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()),
});

export type HabitTemplate = z.infer<typeof habitTemplateSchema>;
