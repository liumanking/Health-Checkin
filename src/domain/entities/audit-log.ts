import { z } from 'zod';
import { idSchema } from './base';

/** 稽核紀錄：每個 Command 寫一筆（append-only，不需 SyncBase）。 */
export const auditLogSchema = z.object({
  id: idSchema,
  memberId: idSchema,
  action: z.string(), // 'create' | 'update' | 'delete' | 'archive' | ...
  entity: z.string(), // 'habit' | 'log' | 'timer_session' | ...
  entityId: z.string(),
  payload: z.string(), // JSON string of changes
  at: z.string(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;
