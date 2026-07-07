import { create } from 'zustand';
import { recordHabitCommand } from '@/application/commands/RecordHabitCommand';
import { dispatch } from '@/application/pipeline/commandPipeline';
import { ask } from '@/application/pipeline/queryPipeline';
import { getTodayListQuery, type TodayItem } from '@/application/queries/GetTodayListQuery';
import { todayLocalDate } from '@/core/utils/date';
import { showToast } from '@/design-system/components/Toast';

interface HistoryStore {
  date: string;
  items: TodayItem[];
  loading: boolean;
  load(memberId: string, date?: string): Promise<void>;
  setDate(memberId: string, date: string): Promise<void>;
  record(memberId: string, habitId: string, amount: number): Promise<void>;
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  date: todayLocalDate(),
  items: [],
  loading: true,

  async load(memberId, date) {
    const targetDate = date ?? get().date;
    set({ loading: true, date: targetDate });
    const result = await ask(getTodayListQuery, { memberId, date: targetDate });
    if (result.ok) {
      set({ items: result.value, loading: false });
    } else {
      set({ loading: false });
      showToast('讀取失敗', 'error');
    }
  },

  async setDate(memberId, date) {
    await get().load(memberId, date);
  },

  async record(memberId, habitId, amount) {
    const { date } = get();
    const result = await dispatch(recordHabitCommand, { habitId, memberId, amount, date });
    if (result.ok) {
      showToast('已補登 ✓', 'success');
      await get().load(memberId, date);
    } else {
      showToast(result.error.message, 'error');
    }
  },
}));
