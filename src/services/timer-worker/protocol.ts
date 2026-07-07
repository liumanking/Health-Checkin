/** 主線程 ↔ timer.worker.ts 訊息協定（設計書 §9）。 */
export type TimerWorkerInMessage =
  | { type: 'START'; accumulatedMs: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'SYNC' };

export type TimerWorkerOutMessage =
  | { type: 'TICK'; elapsedMs: number }
  | { type: 'STOPPED'; elapsedMs: number };
