import { z } from 'zod';
import { categorySchema } from './category';
import { habitSchema } from './habit';
import { habitTagSchema, tagSchema } from './tag';
import { habitTemplateSchema } from './template';
import { logSchema } from './log';
import { memberSchema } from './member';
import { habitReminderSchema } from './reminder';
import { timerProfileSchema } from './timer-profile';
import { timerSessionSchema } from './timer-session';

/** 匯出封套（E11：含 schemaVersion，匯入舊版時走 migration map）。 */
export const exportEnvelopeSchema = z.object({
  schemaVersion: z.number().int().positive(),
  appVersion: z.string(),
  exportedAt: z.string(),
  data: z.object({
    members: z.array(memberSchema),
    habits: z.array(habitSchema),
    logs: z.array(logSchema),
    categories: z.array(categorySchema),
    tags: z.array(tagSchema),
    habitTags: z.array(habitTagSchema),
    reminders: z.array(habitReminderSchema),
    timerSessions: z.array(timerSessionSchema),
    timerProfiles: z.array(timerProfileSchema),
    templates: z.array(habitTemplateSchema),
  }),
});

export type ExportEnvelope = z.infer<typeof exportEnvelopeSchema>;
