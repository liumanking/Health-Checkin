import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { importEnvelope, parseExportEnvelope, type ImportSummary } from '@/data/export/import';
import { idSchema } from '@/domain/entities/base';

const inputSchema = z.object({
  memberId: idSchema,
  raw: z.unknown(),
});

type Input = z.infer<typeof inputSchema>;

/** 匯入備份檔：以 id 為準整批 upsert（還原/合併，不刪除既有資料）。 */
export const importDataCommand: Command<Input, ImportSummary> = {
  name: 'ImportData',
  input: inputSchema,

  async execute({ memberId, raw }) {
    const envelope = parseExportEnvelope(raw);
    const summary = await importEnvelope(envelope);

    return {
      output: summary,
      audits: [
        {
          memberId,
          action: 'import',
          entity: 'export_envelope',
          entityId: 'bulk',
          payload: summary,
        },
      ],
    };
  },
};
