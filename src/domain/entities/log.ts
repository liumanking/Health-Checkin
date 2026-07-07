import { z } from 'zod';
import { idSchema, syncBaseSchema } from './base';

export const logSourceSchema = z.enum(['app', 'shortcut', 'notification', 'line']);
export type LogSource = z.infer<typeof logSourceSchema>;

/** E12：date 存 local date（YYYY-MM-DD），at 存 ISO 8601 精確時間。 */
export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '需為 YYYY-MM-DD');

export const logSchema = syncBaseSchema.extend({
  id: idSchema,
  habitId: idSchema,
  memberId: idSchema,
  date: localDateSchema,
  amount: z.number(),
  source: logSourceSchema,
  at: z.string(),
  note: z.string().optional(),
});

export type Log = z.infer<typeof logSchema>;
