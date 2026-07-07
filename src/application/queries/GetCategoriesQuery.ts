import type { Query } from '@/core/cqrs/query';
import { categoryRepository } from '@/data/repositories/category-repository';
import type { Category } from '@/domain/entities/category';

interface Input {
  memberId: string;
}

export const getCategoriesQuery: Query<Input, Category[]> = {
  name: 'GetCategories',

  async execute({ memberId }) {
    return categoryRepository.search({ memberId });
  },
};
