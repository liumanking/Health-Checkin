import type { Member } from '@/domain/entities/member';
import type { BaseQuery } from '@/domain/queries/base-query';
import type { Repository } from './base-repo';

export type MemberRepository = Repository<Member, BaseQuery>;
