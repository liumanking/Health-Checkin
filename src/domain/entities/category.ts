import { z } from 'zod';
import { idSchema, syncBaseSchema } from './base';

export const categorySchema = syncBaseSchema.extend({
  id: idSchema,
  memberId: idSchema,
  name: z.string().min(1),
  color: z.string(),
  order: z.number(),
});

export type Category = z.infer<typeof categorySchema>;
