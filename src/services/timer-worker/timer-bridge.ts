import TimerWorkerCtor from './timer.worker?worker';
import type { TimerWorkerOutMessage } from './protocol';

/**
 * 主線程 ↔ Worker 通訊橋接（設計書 §9）。
 * Module-scope Map：SPA 路由切換不會殺掉還在跑的 worker，支援並行多個 session。
 * 整頁重新載入才會清空（此時由呼叫端依 Dexie 的 accumulatedMs 重新 START）。
 */
interface Bridge {
  worker: Worker;
  listeners: Set<(msg: TimerWorkerOutMessage) => void>;
}

const bridges = new Map<string, Bridge>();

function ensure(sessionId: string): { bridge: Bridge; isNew: boolean } {
  let bridge = bridges.get(sessionId);
  if (bridge) return { bridge, isNew: false };

  const worker = new TimerWorkerCtor();
  bridge = { worker, listeners: new Set() };
  worker.onmessage = (e: MessageEvent<TimerWorkerOutMessage>) => {
    for (const listener of bridge!.listeners) listener(e.data);
  };
  bridges.set(sessionId, bridge);
  return { bridge, isNew: true };
}

/**
 * 掛上某個 session 的 worker 並訂閱 TICK/STOPPED。
 * 若 worker 是新建的（頁面剛載入或從未啟動）→ 用 accumulatedMsIfNew 當基準重新開始計時；
 * 若 worker 已在跑（同一 SPA session 內切換頁面回來）→ 只補發一次 SYNC 校正畫面。
 */
export function attachTimerWorker(
  sessionId: string,
  accumulatedMsIfNew: number,
  listener: (msg: TimerWorkerOutMessage) => void,
): () => void {
  const { bridge, isNew } = ensure(sessionId);
  bridge.listeners.add(listener);
  bridge.worker.postMessage(
    isNew ? { type: 'START', accumulatedMs: accumulatedMsIfNew } : { type: 'SYNC' },
  );
  return () => bridge.listeners.delete(listener);
}

export function pauseTimerWorker(sessionId: string): void {
  bridges.get(sessionId)?.worker.postMessage({ type: 'PAUSE' });
}

/** Page Visibility 回前台時呼叫，校正畫面顯示（設計書 §9）。 */
export function syncTimerWorker(sessionId: string): void {
  bridges.get(sessionId)?.worker.postMessage({ type: 'SYNC' });
}

export function stopTimerWorker(sessionId: string): void {
  bridges.get(sessionId)?.worker.postMessage({ type: 'STOP' });
}

/** Pause/Stop/Cancel 之後釋放 worker（該 session 已無需背景計時）。 */
export function releaseTimerWorker(sessionId: string): void {
  const bridge = bridges.get(sessionId);
  if (!bridge) return;
  bridge.worker.terminate();
  bridges.delete(sessionId);
}
