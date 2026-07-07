import { Bell, BellOff, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { addReminderCommand } from '@/application/commands/AddReminderCommand';
import { deleteReminderCommand } from '@/application/commands/DeleteReminderCommand';
import { toggleReminderCommand } from '@/application/commands/ToggleReminderCommand';
import { dispatch } from '@/application/pipeline/commandPipeline';
import { ask } from '@/application/pipeline/queryPipeline';
import { getHabitRemindersQuery } from '@/application/queries/GetHabitRemindersQuery';
import { Card } from '@/design-system/components/Card';
import { showToast } from '@/design-system/components/Toast';
import type { HabitReminder } from '@/domain/entities/reminder';

interface Props {
  habitId: string;
  memberId: string;
}

/** 每天固定時段提醒（P5：rule 固定 daily，多時段＝多筆）。 */
export function ReminderSection({ habitId, memberId }: Props) {
  const [reminders, setReminders] = useState<HabitReminder[]>([]);
  const [newTime, setNewTime] = useState('08:00');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, [habitId]);

  async function load() {
    setLoading(true);
    const result = await ask(getHabitRemindersQuery, { habitId });
    if (result.ok) setReminders(result.value);
    setLoading(false);
  }

  async function requestPermissionIfNeeded() {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  async function add() {
    await requestPermissionIfNeeded();
    const result = await dispatch(addReminderCommand, { habitId, memberId, time: newTime });
    if (result.ok) {
      setReminders((prev) => [...prev, result.value].sort((a, b) => a.time.localeCompare(b.time)));
      if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        showToast('已新增，但瀏覽器封鎖了通知權限，提醒不會跳出來', 'info');
      }
    } else {
      showToast(result.error.message, 'error');
    }
  }

  async function toggle(reminder: HabitReminder, enabled: boolean) {
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, enabled } : r)));
    const result = await dispatch(toggleReminderCommand, { reminderId: reminder.id, memberId, enabled });
    if (!result.ok) {
      setReminders((prev) => prev.map((r) => (r.id === reminder.id ? { ...r, enabled: !enabled } : r)));
      showToast(result.error.message, 'error');
    }
  }

  async function remove(reminderId: string) {
    const previous = reminders;
    setReminders(previous.filter((r) => r.id !== reminderId));
    const result = await dispatch(deleteReminderCommand, { reminderId, memberId });
    if (!result.ok) {
      setReminders(previous);
      showToast(result.error.message, 'error');
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700">提醒</p>

      {!loading && reminders.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {reminders.map((r) => (
            <li key={r.id} className="flex min-h-11 items-center gap-2">
              <button
                type="button"
                onClick={() => void toggle(r, !r.enabled)}
                aria-label={r.enabled ? `關閉 ${r.time} 提醒` : `開啟 ${r.time} 提醒`}
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  r.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {r.enabled ? <Bell size={16} aria-hidden /> : <BellOff size={16} aria-hidden />}
              </button>
              <span className={`flex-1 text-sm ${r.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                {r.time} · 每天
              </span>
              <button
                type="button"
                onClick={() => void remove(r.id)}
                aria-label={`刪除 ${r.time} 提醒`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 active:bg-red-50 active:text-red-500"
              >
                <X size={16} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          aria-label="提醒時間"
          className="h-11 rounded-xl border border-gray-300 px-3 text-base outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={() => void add()}
          aria-label="新增提醒"
          className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl bg-indigo-50 px-3 text-sm font-medium text-indigo-600 active:bg-indigo-100"
        >
          <Plus size={16} aria-hidden />
          新增
        </button>
      </div>
    </Card>
  );
}
