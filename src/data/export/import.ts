import { EXPORT_SCHEMA_VERSION } from '@/config/db-config';
import { ValidationError } from '@/core/errors/app-error';
import { db } from '@/data/db/database';
import { exportEnvelopeSchema, type ExportEnvelope } from '@/domain/entities/export-envelope';

/** schemaVersion 升級對照表（E11）：目前只有 v1，未來版本在此擴充轉換函式。 */
const MIGRATIONS: Record<number, (data: unknown) => unknown> = {};

/** 解析＋驗證匯入檔案，必要時先走 migration map 升級到目前版本。 */
export function parseExportEnvelope(raw: unknown): ExportEnvelope {
  const parsed = exportEnvelopeSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  const version = (raw as { schemaVersion?: number } | null)?.schemaVersion;
  if (typeof version === 'number' && version < EXPORT_SCHEMA_VERSION && MIGRATIONS[version]) {
    const migrated = MIGRATIONS[version](raw);
    const reparsed = exportEnvelopeSchema.safeParse(migrated);
    if (reparsed.success) return reparsed.data;
  }

  throw new ValidationError(
    '匯入檔案格式錯誤或版本不支援',
    parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
  );
}

export interface ImportSummary {
  members: number;
  habits: number;
  logs: number;
  categories: number;
  tags: number;
  habitTags: number;
  reminders: number;
  timerSessions: number;
  timerProfiles: number;
  templates: number;
}

/** 匯入＝以 id 為準整批 upsert；不刪除既有、不在檔案內的資料（還原/合併，不是取代）。 */
export async function importEnvelope(envelope: ExportEnvelope): Promise<ImportSummary> {
  const { data } = envelope;

  await db.transaction(
    'rw',
    [
      db.members,
      db.habits,
      db.logs,
      db.categories,
      db.tags,
      db.habitTags,
      db.reminders,
      db.timerSessions,
      db.timerProfiles,
      db.templates,
    ],
    async () => {
      await db.members.bulkPut(data.members);
      await db.habits.bulkPut(data.habits);
      await db.logs.bulkPut(data.logs);
      await db.categories.bulkPut(data.categories);
      await db.tags.bulkPut(data.tags);
      await db.habitTags.bulkPut(data.habitTags);
      await db.reminders.bulkPut(data.reminders);
      await db.timerSessions.bulkPut(data.timerSessions);
      await db.timerProfiles.bulkPut(data.timerProfiles);
      await db.templates.bulkPut(data.templates);
    },
  );

  return {
    members: data.members.length,
    habits: data.habits.length,
    logs: data.logs.length,
    categories: data.categories.length,
    tags: data.tags.length,
    habitTags: data.habitTags.length,
    reminders: data.reminders.length,
    timerSessions: data.timerSessions.length,
    timerProfiles: data.timerProfiles.length,
    templates: data.templates.length,
  };
}
