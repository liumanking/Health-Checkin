import { db } from '@/data/db/database';
import type { Member } from '@/domain/entities/member';
import type { BaseQuery } from '@/domain/queries/base-query';
import type { MemberRepository } from '@/domain/repositories/misc-repos';
import { DexieRepository } from './dexie-repository';

class DexieMemberRepository extends DexieRepository<Member, BaseQuery> {
  protected matches(): boolean {
    return true;
  }
}

export const memberRepository: MemberRepository = new DexieMemberRepository(db.members);
