/// <reference lib="webworker" />
import type { TimerWorkerInMessage, TimerWorkerOutMessage } from './protocol';

/**
 * Dedicated Worker：不受 tab throttle 影響（設計書 §9）。
 * 只負責累計時間並定期回報，不碰 Dexie / Command。
 */
let baseMs = 0;
let runStartedAt: number | null = null;
let tickHandle: ReturnType<typeof setInterval> | undefined;

function elapsedMs(): number {
  return baseMs + (runStartedAt !== null ? Date.now() - runStartedAt : 0);
}

function post(msg: TimerWorkerOutMessage): void {
  postMessage(msg);
}

function startTicking(): void {
  stopTicking();
  tickHandle = setInterval(() => post({ type: 'TICK', elapsedMs: elapsedMs() }), 1000);
}

function stopTicking(): void {
  if (tickHandle !== undefined) {
    clearInterval(tickHandle);
    tickHandle = undefined;
  }
}

self.onmessage = (e: MessageEvent<TimerWorkerInMessage>) => {
  const msg = e.data;
  switch (msg.type) {
    case 'START':
      baseMs = msg.accumulatedMs;
      runStartedAt = Date.now();
      startTicking();
      post({ type: 'TICK', elapsedMs: elapsedMs() });
      break;
    case 'RESUME':
      runStartedAt = Date.now();
      startTicking();
      post({ type: 'TICK', elapsedMs: elapsedMs() });
      break;
    case 'PAUSE':
      baseMs = elapsedMs();
      runStartedAt = null;
      stopTicking();
      post({ type: 'TICK', elapsedMs: baseMs });
      break;
    case 'SYNC':
      post({ type: 'TICK', elapsedMs: elapsedMs() });
      break;
    case 'STOP':
      stopTicking();
      post({ type: 'STOPPED', elapsedMs: elapsedMs() });
      break;
  }
};
