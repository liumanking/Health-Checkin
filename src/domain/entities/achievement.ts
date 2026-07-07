import { z } from 'zod';
import { idSchema, syncBaseSchema } from './base';

// === 成就（預留模型：P0 只定型別 + 表，評估器與 UI 後補）===

export const achievementMetricSchema = z.enum(['count', 'minutes', 'distance']);
export type AchievementMetric = z.infer<typeof achievementMetricSchema>;

export const achievementSchema = z.object({
  id: idSchema,
  code: z.string().min(1),
  name: z.string().min(1),
  emoji: z.string(),
  metric: achievementMetricSchema,
  threshold: z.number().positive(),
});
export type Achievement = z.infer<typeof achievementSchema>;

export const achievementRuleSchema = z.object({
  id: idSchema,
  achievementId: idSchema,
  scope: z.enum(['global', 'habit', 'category']),
  window: z.enum(['total', 'year']),
});
export type AchievementRule = z.infer<typeof achievementRuleSchema>;

export const userAchievementSchema = syncBaseSchema.extend({
  id: idSchema,
  memberId: idSchema,
  achievementId: idSchema,
  unlockedAt: z.string(),
});
export type UserAchievement = z.infer<typeof userAchievementSchema>;
