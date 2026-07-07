import type { Command } from '@/core/cqrs/command';
import { configureCommandPipeline, runCommand } from '@/core/cqrs/pipeline';
import type { AppError } from '@/core/errors/app-error';
import type { Result } from '@/core/result/result';
import { auditService } from '@/services/audit/audit-service';

let configured = false;

/** App 啟動時呼叫一次：注入 audit 服務。 */
export function setupCommandPipeline(): void {
  if (configured) return;
  configureCommandPipeline({ audit: auditService });
  configured = true;
}

/**
 * 寫入口（鐵律 6）：UI / 通知 / LINE Bot / AI 一律經此 dispatch。
 * P0 尚無具體 Command；P1 起的 RecordHabitCommand 等都走這裡。
 */
export async function dispatch<TInput, TOutput>(
  command: Command<TInput, TOutput>,
  rawInput: unknown,
): Promise<Result<TOutput, AppError>> {
  return runCommand(command, rawInput);
}
