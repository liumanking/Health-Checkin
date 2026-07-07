import { create } from 'zustand';
import { cancelTimerCommand } from '@/application/commands/CancelTimerCommand';
import { pauseTimerCommand } from '@/application/commands/PauseTimerCommand';
import { startTimerCommand } from '@/application/commands/StartTimerCommand';
import { stopTimerCommand } from '@/application/commands/StopTimerCommand';
import { dispatch } from '@/application/pipeline/commandPipeline';
import { ask } from '@/application/pipeline/queryPipeline';
import { getActiveTimerSessionQuery } from '@/application/queries/GetActiveTimerSessionQuery';
import { getHabitDetailQuery } from '@/application/queries/GetHabitDetailQuery';
import {
  attachTimerWorker,
  releaseTimerWorker,
  stopTimerWorker,
} from '@/services/timer-worker/timer-bridge';
import type { Habit } from '@/domain/entities/habit';
import type { TimerSession } from '@/domain/entities/timer-session';
import { showToast } from '@/design-system/components/Toast';

interface TimerStore {
  habit: Habit | null;
  session: TimerSession | null;
  elapsedMs: number;
  loading: boolean;
  unsubscribe: (() => void) | null;

  load(habitId: string, memberId: string): Promise<void>;
  start(memberId: string): Promise<void>;
  pause(memberId: string): Promise<void>;
  stop(memberId: string): Promise<void>;
  cancel(memberId: string): Promise<void>;
  leave(): void;
}

function notify(minutes: number): void {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification('計時完成', { body: `已記錄 ${minutes} 分鐘` });
  } else if (Notification.permission === 'default') {
    void Notification.requestPermission();
  }
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  habit: null,
  session: null,
  elapsedMs: 0,
  loading: true,
  unsubscribe: null,

  async load(habitId, memberId) {
    get().unsubscribe?.();
    set({ loading: true, unsubscribe: null });

    const [habitResult, sessionResult] = await Promise.all([
      ask(getHabitDetailQuery, { habitId }),
      ask(getActiveTimerSessionQuery, { habitId, memberId }),
    ]);

    if (!habitResult.ok || !habitResult.value) {
      showToast('找不到這個習慣', 'error');
      set({ loading: false, habit: null, session: null });
      return;
    }

    const session = sessionResult.ok ? (sessionResult.value ?? null) : null;
    set({ habit: habitResult.value, session, elapsedMs: session?.accumulatedMs ?? 0, loading: false });

    if (session?.status === 'running') {
      const unsubscribe = attachTimerWorker(session.id, session.accumulatedMs, (msg) => {
        if (msg.type === 'TICK' || msg.type === 'STOPPED') {
          set({ elapsedMs: msg.elapsedMs });
        }
      });
      set({ unsubscribe });
    }
  },

  async start(memberId) {
    const { habit, session } = get();
    if (!habit) return;
    const result = await dispatch(startTimerCommand, {
      habitId: habit.id,
      memberId,
      sessionId: session?.status === 'paused' ? session.id : undefined,
    });
    if (!result.ok) {
      showToast(result.error.message, 'error');
      return;
    }
    const started = result.value;
    set({ session: started, elapsedMs: started.accumulatedMs });
    const unsubscribe = attachTimerWorker(started.id, started.accumulatedMs, (msg) => {
      if (msg.type === 'TICK' || msg.type === 'STOPPED') {
        set({ elapsedMs: msg.elapsedMs });
      }
    });
    set({ unsubscribe });
  },

  async pause(memberId) {
    const { session, elapsedMs, unsubscribe } = get();
    if (!session) return;
    const result = await dispatch(pauseTimerCommand, { sessionId: session.id, memberId, elapsedMs });
    if (!result.ok) {
      showToast(result.error.message, 'error');
      return;
    }
    unsubscribe?.();
    releaseTimerWorker(session.id);
    set({ session: result.value, elapsedMs: result.value.accumulatedMs, unsubscribe: null });
  },

  async stop(memberId) {
    const { session, elapsedMs, unsubscribe } = get();
    if (!session) return;
    stopTimerWorker(session.id);
    const result = await dispatch(stopTimerCommand, { sessionId: session.id, memberId, elapsedMs });
    unsubscribe?.();
    releaseTimerWorker(session.id);
    if (!result.ok) {
      showToast(result.error.message, 'error');
      return;
    }
    navigator.vibrate?.(50);
    notify(result.value.log.amount);
    showToast(`已記錄 ${result.value.log.amount} 分鐘 ✓`, 'success');
    set({ session: result.value.session, elapsedMs: result.value.session.accumulatedMs, unsubscribe: null });
  },

  async cancel(memberId) {
    const { session, unsubscribe } = get();
    if (!session) return;
    const result = await dispatch(cancelTimerCommand, { sessionId: session.id, memberId });
    unsubscribe?.();
    releaseTimerWorker(session.id);
    if (!result.ok) {
      showToast(result.error.message, 'error');
      return;
    }
    showToast('已捨棄這次計時', 'info');
    set({ session: result.value, unsubscribe: null });
  },

  leave() {
    get().unsubscribe?.();
    set({ unsubscribe: null });
  },
}));
