import { ValidationError, toAppError, type AppError } from '@/core/errors/app-error';
import { eventBus } from '@/core/event-bus/bus';
import { logger } from '@/core/logger/logger';
import { err, ok, type Result } from '@/core/result/result';
import type { AuditDraft, Command } from './command';
import type { Query } from './query';

/** 稽核寫入介面：由 services/audit 實作，於 app 啟動時注入。 */
export interface AuditWriter {
  write(draft: AuditDraft): Promise<void>;
}

let auditWriter: AuditWriter | undefined;

export function configureCommandPipeline(deps: { audit: AuditWriter }): void {
  auditWriter = deps.audit;
}

/**
 * 寫管線：validate(Zod) → handle → emit DomainEvent → writeAuditLog。
 */
export async function runCommand<TInput, TOutput>(
  command: Command<TInput, TOutput>,
  rawInput: unknown,
): Promise<Result<TOutput, AppError>> {
  const parsed = command.input.safeParse(rawInput);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    logger.warn('command validation failed', { command: command.name, issues });
    return err(new ValidationError(`${command.name} 輸入驗證失敗`, issues));
  }

  try {
    const outcome = await command.execute(parsed.data);

    for (const event of outcome.events ?? []) {
      eventBus.emit(event);
    }

    if (outcome.audits && outcome.audits.length > 0) {
      if (!auditWriter) {
        logger.warn('audit writer not configured, audit skipped', { command: command.name });
      } else {
        for (const draft of outcome.audits) {
          await auditWriter.write(draft);
        }
      }
    }

    return ok(outcome.output);
  } catch (e) {
    const appError = toAppError(e);
    logger.error('command failed', { command: command.name, error: appError.message });
    return err(appError);
  }
}

/** 讀管線：handle → return（無副作用）。 */
export async function runQuery<TInput, TOutput>(
  query: Query<TInput, TOutput>,
  input: TInput,
): Promise<Result<TOutput, AppError>> {
  try {
    return ok(await query.execute(input));
  } catch (e) {
    const appError = toAppError(e);
    logger.error('query failed', { query: query.name, error: appError.message });
    return err(appError);
  }
}
