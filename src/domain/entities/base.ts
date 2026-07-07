import { z } from 'zod';

/** 同步基底（鐵律 5 / 架構原則 7）：所有實體帶時戳 + 軟刪除 + syncVersion。 */
export const syncBaseSchema = z.object({
  createdAt: z.string(), // ISO 8601
  updatedAt: z.string(),
  deletedAt: z.string().optional(), // 軟刪除：設值即視為已刪
  syncVersion: z.number().int().nonnegative(),
});

export type SyncBase = z.infer<typeof syncBaseSchema>;

export const idSchema = z.string().min(1);

/** 建立新實體時的 SyncBase 欄位。 */
export function newSyncBase(now: string): SyncBase {
  return { createdAt: now, updatedAt: now, syncVersion: 0 };
}

export function isDeleted(e: Pick<SyncBase, 'deletedAt'>): boolean {
  return e.deletedAt !== undefined;
}
