import { appConfig } from '@/config/app-config';
import { EXPORT_SCHEMA_VERSION } from '@/config/db-config';
import { db } from '@/data/db/database';
import { nowIso } from '@/core/utils/date';
import type { ExportEnvelope } from '@/domain/entities/export-envelope';

/** 匯出用完整資料：直接讀 Dexie 原始表（含軟刪除墓碑，保留完整還原能力）。 */
export async function buildExportEnvelope(): Promise<ExportEnvelope> {
  const [
    members,
    habits,
    logs,
    categories,
    tags,
    habitTags,
    reminders,
    timerSessions,
    timerProfiles,
    templates,
  ] = await Promise.all([
    db.members.toArray(),
    db.habits.toArray(),
    db.logs.toArray(),
    db.categories.toArray(),
    db.tags.toArray(),
    db.habitTags.toArray(),
    db.reminders.toArray(),
    db.timerSessions.toArray(),
    db.timerProfiles.toArray(),
    db.templates.toArray(),
  ]);

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    appVersion: appConfig.appVersion,
    exportedAt: nowIso(),
    data: {
      members,
      habits,
      logs,
      categories,
      tags,
      habitTags,
      reminders,
      timerSessions,
      timerProfiles,
      templates,
    },
  };
}
