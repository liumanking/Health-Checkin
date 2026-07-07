import type { Query } from '@/core/cqrs/query';
import { tagRepository } from '@/data/repositories/tag-repository';
import type { Tag } from '@/domain/entities/tag';

interface Input {
  memberId: string;
}

export const getTagsQuery: Query<Input, Tag[]> = {
  name: 'GetTags',

  async execute({ memberId }) {
    return tagRepository.search({ memberId });
  },
};
