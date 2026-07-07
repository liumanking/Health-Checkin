import { ask } from '@/application/pipeline/queryPipeline';
import { getActiveRemindersQuery } from '@/application/queries/GetActiveRemindersQuery';
import { getTodayListQuery } from '@/application/queries/GetTodayListQuery';
import { logger } from '@/core/logger/logger';
import { todayLocalDate } from '@/core/utils/date';

/**
 * 前台提醒排程器（設計書 P5：Notification API 前台，Push/背景留 Phase2）。
 * 每 30 秒檢查一次目前時間是否命中某個啟用中的提醒；已完成的習慣不提醒。
 */
const CHECK_INTERVAL_MS = 30_000;

let intervalHandle: ReturnType<typeof setInterval> | undefined;
let currentMemberId: string | null = null;
let firedToday = new Set<string>(); // `${reminderId}:${YYYY-MM-DD}`

function nowHHmm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

async function check(): Promise<void> {
  if (!currentMemberId) return;
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

  const today = todayLocalDate();
  // 換日：清掉舊日期的已發送紀錄，避免無限增長。
  firedToday = new Set([...firedToday].filter((k) => k.endsWith(today)));

  const hhmm = nowHHmm();
  const [remindersResult, todayResult] = await Promise.all([
    ask(getActiveRemindersQuery, { memberId: currentMemberId }),
    ask(getTodayListQuery, { memberId: currentMemberId, date: today }),
  ]);
  if (!remindersResult.ok) return;

  const completedHabitIds = new Set(
    todayResult.ok ? todayResult.value.filter((i) => i.completed).map((i) => i.habit.id) : [],
  );

  for (const { reminder, habit } of remindersResult.value) {
    if (reminder.rule !== 'daily') continue; // 其餘規則（P5 之後）
    if (reminder.time !== hhmm) continue;

    const key = `${reminder.id}:${today}`;
    if (firedToday.has(key)) continue;
    if (completedHabitIds.has(habit.id)) continue; // 已完成不再提醒

    firedToday.add(key);
    try {
      const notification = new Notification(`${habit.emoji} ${habit.name}`, {
        body: '該打卡囉',
        tag: reminder.id,
      });
      // 通知快速動作：點通知＝聚焦回 App（前台提醒範圍內的最小可行動作）。
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      logger.warn('reminder notification failed', { error: String(e) });
    }
  }
}

export function startReminderScheduler(memberId: string): void {
  currentMemberId = memberId;
  if (intervalHandle) return;
  intervalHandle = setInterval(() => void check(), CHECK_INTERVAL_MS);
  void check();
}

export function stopReminderScheduler(): void {
  if (intervalHandle !== undefined) {
    clearInterval(intervalHandle);
    intervalHandle = undefined;
  }
  currentMemberId = null;
}
