import { z } from 'zod';
import { idSchema, syncBaseSchema } from './base';

export const memberSchema = syncBaseSchema.extend({
  id: idSchema,
  name: z.string().min(1),
});

export type Member = z.infer<typeof memberSchema>;
