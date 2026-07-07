import { z } from 'zod';
import { idSchema } from './base';

// === 摘要（介面先行：P0 不物化，統計即時從 Log 計算）===

export const dailySummarySchema = z.object({
  memberId: idSchema,
  habitId: idSchema,
  periodKey: z.string(), // "YYYY-MM-DD"
  total: z.number(),
  completed: z.boolean(),
});
export type DailySummary = z.infer<typeof dailySummarySchema>;

export const weeklySummarySchema = z.object({
  memberId: idSchema,
  habitId: idSchema,
  periodKey: z.string(), // "YYYY-Www"
  total: z.number(),
  completed: z.boolean(),
});
export type WeeklySummary = z.infer<typeof weeklySummarySchema>;

export const monthlySummarySchema = z.object({
  memberId: idSchema,
  habitId: idSchema,
  periodKey: z.string(), // "YYYY-MM"
  total: z.number(),
  completed: z.boolean(),
});
export type MonthlySummary = z.infer<typeof monthlySummarySchema>;
