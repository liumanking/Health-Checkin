import type { Tag } from '@/domain/entities/tag';
import type { TagQuery } from '@/domain/queries/tag-query';
import type { Repository } from './base-repo';

export type TagRepository = Repository<Tag, TagQuery>;
