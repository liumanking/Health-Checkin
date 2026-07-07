import type { Table } from 'dexie';
import { DbError } from '@/core/errors/app-error';
import { nowIso } from '@/core/utils/date';
import type { SyncBase } from '@/domain/entities/base';

/**
 * LocalDataSource：Dexie CRUD 通用實作。
 * 鐵律 5：刪除 = 設 deletedAt；讀取一律過濾 deletedAt !== undefined。
 */
export class DexieLocalSource<T extends SyncBase & { id: string }> {
  constructor(private readonly table: Table<T, string>) {}

  async getById(id: string): Promise<T | undefined> {
    try {
      const entity = await this.table.get(id);
      return entity && entity.deletedAt === undefined ? entity : undefined;
    } catch (e) {
      throw new DbError(`getById failed on ${this.table.name}`, { cause: e });
    }
  }

  /** 寫入：stamp updatedAt、遞增 syncVersion（既有實體）。 */
  async put(entity: T): Promise<void> {
    try {
      const existing = await this.table.get(entity.id);
      const next: T = {
        ...entity,
        updatedAt: nowIso(),
        syncVersion: existing ? existing.syncVersion + 1 : entity.syncVersion,
      };
      await this.table.put(next);
    } catch (e) {
      throw new DbError(`put failed on ${this.table.name}`, { cause: e });
    }
  }

  async softDelete(id: string): Promise<void> {
    try {
      const existing = await this.table.get(id);
      if (!existing || existing.deletedAt !== undefined) return;
      const now = nowIso();
      await this.table.put({
        ...existing,
        deletedAt: now,
        updatedAt: now,
        syncVersion: existing.syncVersion + 1,
      });
    } catch (e) {
      throw new DbError(`softDelete failed on ${this.table.name}`, { cause: e });
    }
  }

  /** 全表讀取後於記憶體過濾（P0 資料量小；後續視需要改 where 索引）。 */
  async getAll(includeDeleted = false): Promise<T[]> {
    try {
      const items = await this.table.toArray();
      return includeDeleted ? items : items.filter((e) => e.deletedAt === undefined);
    } catch (e) {
      throw new DbError(`getAll failed on ${this.table.name}`, { cause: e });
    }
  }
}
