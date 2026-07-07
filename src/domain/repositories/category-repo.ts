import type { Category } from '@/domain/entities/category';
import type { CategoryQuery } from '@/domain/queries/category-query';
import type { Repository } from './base-repo';

export type CategoryRepository = Repository<Category, CategoryQuery>;
