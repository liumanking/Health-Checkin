import { create } from 'zustand';
import { recordHabitCommand } from '@/application/commands/RecordHabitCommand';
import { dispatch } from '@/application/pipeline/commandPipeline';
import { ask } from '@/application/pipeline/queryPipeline';
import { getTodayListQuery, type TodayItem } from '@/application/queries/GetTodayListQuery';
import { eventBus } from '@/core/event-bus/bus';
import { todayLocalDate } from '@/core/utils/date';
import { showToast } from '@/design-system/components/Toast';

interface TodayStore {
  memberId: string | null;
  date: string;
  items: TodayItem[];
  loading: boolean;
  load(memberId: string): Promise<void>;
  refresh(): Promise<void>;
  record(habitId: string, amount: number): Promise<void>;
}

export const useTodayStore = create<TodayStore>((set, get) => ({
  memberId: null,
  date: todayLocalDate(),
  items: [],
  loading: false,

  async load(memberId) {
    set({ memberId, loading: true });
    await get().refresh();
  },

  async refresh() {
    const { memberId } = get();
    if (!memberId) return;
    const date = todayLocalDate(); // 跨日時自動換日
    const result = await ask(getTodayListQuery, { memberId, date });
    if (result.ok) {
      set({ items: result.value, date, loading: false });
    } else {
      set({ loading: false });
      showToast('讀取失敗', 'error');
    }
  },

  async record(habitId, amount) {
    const { memberId } = get();
    if (!memberId) return;
    const result = await dispatch(recordHabitCommand, { habitId, memberId, amount });
    if (result.ok) {
      navigator.vibrate?.(50); // E7：打卡成功短震動
      showToast('已記錄 ✓', 'success');
    } else {
      showToast(result.error.message, 'error');
    }
  },
}));

// 事件只通知「發生了什麼」，資料由 store 重新走 Query 取（鐵律 8）
eventBus.on('TodayListChanged', () => {
  void useTodayStore.getState().refresh();
});
