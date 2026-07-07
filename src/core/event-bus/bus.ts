import { logger } from '@/core/logger/logger';
import type { AnyEvent, EventLayer, EventType } from './types';

type EventOfType<T extends EventType> = Extract<AnyEvent, { type: T }>;
type Handler<T extends EventType> = (event: EventOfType<T>) => void;
type AnyHandler = (event: AnyEvent) => void;

class EventBus {
  private handlers = new Map<EventType, Set<AnyHandler>>();

  /** 訂閱事件，回傳取消訂閱函式。 */
  on<T extends EventType>(type: T, handler: Handler<T>): () => void {
    const set = this.handlers.get(type) ?? new Set<AnyHandler>();
    // 依 type 分桶派發，僅收到對應事件，收窄安全
    const anyHandler = handler as unknown as AnyHandler;
    set.add(anyHandler);
    this.handlers.set(type, set);
    return () => {
      set.delete(anyHandler);
    };
  }

  emit(event: AnyEvent): void {
    const set = this.handlers.get(event.type);
    if (!set) return;
    for (const handler of set) {
      try {
        handler(event);
      } catch (e) {
        logger.error('event handler failed', { type: event.type, error: String(e) });
      }
    }
  }
}

export const eventBus = new EventBus();

/** 便利建構：補上 at 時戳。 */
export function makeEvent<T extends AnyEvent['type']>(
  type: T,
  layer: EventLayer,
  payload: EventOfType<T>['payload'],
): EventOfType<T> {
  return { type, layer, at: new Date().toISOString(), payload } as EventOfType<T>;
}
