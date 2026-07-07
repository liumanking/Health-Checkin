import type { Table } from 'dexie';
import type { SyncBase } from '@/domain/entities/base';
import type { Repository } from '@/domain/repositories/base-repo';
import { DexieLocalSource } from '@/data/sources/local/dexie-source';

/**
 * 通用 Repository 實作：組合 LocalDataSource（RemoteDataSource 為 Phase 2 預留）。
 * 各實體 Repository 以 matches() 實作自己的 Query specification 過濾。
 */
export abstract class DexieRepository<T extends SyncBase & { id: string }, Q>
  implements Repository<T, Q>
{
  protected readonly local: DexieLocalSource<T>;

  constructor(table: Table<T, string>) {
    this.local = new DexieLocalSource(table);
  }

  protected abstract matches(entity: T, query: Q): boolean;

  /** 預設排序：不排序。子類覆寫。 */
  protected sort(items: T[]): T[] {
    return items;
  }

  async search(query: Q): Promise<T[]> {
    const includeDeleted =
      (query as { includeDeleted?: boolean }).includeDeleted === true;
    const all = await this.local.getAll(includeDeleted);
    return this.sort(all.filter((e) => this.matches(e, query)));
  }

  async getById(id: string): Promise<T | undefined> {
    return this.local.getById(id);
  }

  async upsert(entity: T): Promise<void> {
    await this.local.put(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.local.softDelete(id);
  }
}
