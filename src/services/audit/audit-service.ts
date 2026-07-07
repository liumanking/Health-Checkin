import type { AuditDraft } from '@/core/cqrs/command';
import type { AuditWriter } from '@/core/cqrs/pipeline';
import { nowIso } from '@/core/utils/date';
import { newId } from '@/core/utils/id';
import { db } from '@/data/db/database';

/** AuditLog 寫入服務：由 command pipeline 呼叫（鐵律：每個 Command 都要寫 AuditLog）。 */
export class AuditService implements AuditWriter {
  async write(draft: AuditDraft): Promise<void> {
    await db.auditLogs.put({
      id: newId(),
      memberId: draft.memberId,
      action: draft.action,
      entity: draft.entity,
      entityId: draft.entityId,
      payload: JSON.stringify(draft.payload ?? null),
      at: nowIso(),
    });
  }
}

export const auditService = new AuditService();
