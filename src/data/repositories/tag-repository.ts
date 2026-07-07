import { db } from '@/data/db/database';
import type { Tag } from '@/domain/entities/tag';
import type { TagQuery } from '@/domain/queries/tag-query';
import type { TagRepository } from '@/domain/repositories/tag-repo';
import { DexieRepository } from './dexie-repository';

class DexieTagRepository extends DexieRepository<Tag, TagQuery> implements TagRepository {
  protected matches(t: Tag, q: TagQuery): boolean {
    if (q.memberId !== undefined && t.memberId !== q.memberId) return false;
    return true;
  }

  protected override sort(items: Tag[]): Tag[] {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const tagRepository: TagRepository = new DexieTagRepository(db.tags);
