import type { SyncBase } from '@/domain/entities/base';

/**
 * RemoteDataSource 介面（Phase 2：Cloudflare Workers + D1）。
 * P0 只預留介面，不實作、不呼叫。
 */
export interface RemoteDataSource<T extends SyncBase & { id: string }> {
  pull(sinceSyncVersion: number): Promise<T[]>;
  push(entities: T[]): Promise<void>;
}
