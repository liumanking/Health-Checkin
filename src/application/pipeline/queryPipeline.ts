import { runQuery } from '@/core/cqrs/pipeline';
import type { Query } from '@/core/cqrs/query';
import type { AppError } from '@/core/errors/app-error';
import type { Result } from '@/core/result/result';

/** 讀入口：handle → return（無副作用）。 */
export async function ask<TInput, TOutput>(
  query: Query<TInput, TOutput>,
  input: TInput,
): Promise<Result<TOutput, AppError>> {
  return runQuery(query, input);
}
