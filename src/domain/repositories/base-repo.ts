import type { SyncBase } from '@/domain/entities/base';

/**
 * Repository 介面（鐵律 11）：只有 search(Query) / getById / upsert / softDelete。
 * upsert 由實作負責 stamp updatedAt 與遞增 syncVersion。
 */
export interface Repository<TEntity extends SyncBase & { id: string }, TQuery> {
  search(query: TQuery): Promise<TEntity[]>;
  getById(id: string): Promise<TEntity | undefined>;
  upsert(entity: TEntity): Promise<void>;
  softDelete(id: string): Promise<void>;
}
