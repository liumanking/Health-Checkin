import { db } from '@/data/db/database';
import type { Category } from '@/domain/entities/category';
import type { CategoryQuery } from '@/domain/queries/category-query';
import type { CategoryRepository } from '@/domain/repositories/category-repo';
import { DexieRepository } from './dexie-repository';

class DexieCategoryRepository
  extends DexieRepository<Category, CategoryQuery>
  implements CategoryRepository
{
  protected matches(c: Category, q: CategoryQuery): boolean {
    if (q.memberId !== undefined && c.memberId !== q.memberId) return false;
    return true;
  }

  protected override sort(items: Category[]): Category[] {
    return [...items].sort((a, b) => a.order - b.order);
  }
}

export const categoryRepository: CategoryRepository = new DexieCategoryRepository(db.categories);
