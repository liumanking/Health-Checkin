import { z } from 'zod';
import { idSchema, syncBaseSchema } from './base';

export const tagSchema = syncBaseSchema.extend({
  id: idSchema,
  memberId: idSchema,
  name: z.string().min(1),
});

export type Tag = z.infer<typeof tagSchema>;

/** Habit ↔ Tag 多對多關聯（無 SyncBase：以複合主鍵整筆增刪）。 */
export const habitTagSchema = z.object({
  habitId: idSchema,
  tagId: idSchema,
});

export type HabitTag = z.infer<typeof habitTagSchema>;
