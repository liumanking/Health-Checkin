import type { ZodType } from 'zod';
import type { AnyEvent } from '@/core/event-bus/types';

/** 稽核草稿：pipeline 統一寫入 AuditLog（鐵律：每個 Command 都要寫 AuditLog）。 */
export interface AuditDraft {
  memberId: string;
  action: string; // 'create' | 'update' | 'delete' | 'archive' | ...
  entity: string; // 'habit' | 'log' | 'timer_session' | ...
  entityId: string;
  payload: unknown; // pipeline 序列化為 JSON string
}

export interface CommandOutcome<TOutput> {
  output: TOutput;
  /** Domain / Application 事件皆可（pipeline 統一 emit）。 */
  events?: AnyEvent[];
  audits?: AuditDraft[];
}

/**
 * Command base（寫意圖）。
 * 鐵律 6/7：所有寫操作走 Command + pipeline；入口必須 Zod parse。
 */
export interface Command<TInput, TOutput> {
  readonly name: string;
  readonly input: ZodType<TInput>;
  execute(input: TInput): Promise<CommandOutcome<TOutput>>;
}
