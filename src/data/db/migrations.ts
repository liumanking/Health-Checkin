import type Dexie from 'dexie';

/**
 * Dexie schema 版本註冊。
 * 升版規則：新增 registerSchemaV{n}，同步調整 config/db-config.ts 的 DB_SCHEMA_VERSION，
 * 並在 .upgrade(tx => ...) 中寫資料遷移（對應匯出封套 schemaVersion 的 migration map）。
 */
export function registerSchema(db: Dexie): void {
  db.version(1).stores({
    members: 'id, name',
    habits: 'id, memberId, categoryId, [memberId+archived], order',
    logs: 'id, habitId, memberId, date, [habitId+date], [memberId+date]',
    categories: 'id, memberId, order',
    tags: 'id, memberId',
    habitTags: '[habitId+tagId], habitId, tagId',
    reminders: 'id, habitId',
    timerSessions: 'id, habitId, memberId, status, [memberId+status]',
    timerProfiles: 'id, habitId',
    templates: 'id',
    achievements: 'id, code',
    achievementRules: 'id, achievementId',
    userAchievements: 'id, memberId, achievementId',
    auditLogs: 'id, memberId, entity, at',
  });

  // v2 範例（預留）：
  // db.version(2).stores({ ... }).upgrade(async (tx) => { ... });
}
