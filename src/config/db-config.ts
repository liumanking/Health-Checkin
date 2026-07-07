export const DB_NAME = 'habit-tracker';

/** Dexie schema 版本：升版時在 data/db/migrations.ts 加 upgrade hook。 */
export const DB_SCHEMA_VERSION = 1;

/** 匯出封套 schemaVersion（E11：匯入舊版時走 migration map 升級）。 */
export const EXPORT_SCHEMA_VERSION = 1;
