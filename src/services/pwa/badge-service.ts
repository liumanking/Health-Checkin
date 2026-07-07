import { ask } from '@/application/pipeline/queryPipeline';
import { getTodayListQuery } from '@/application/queries/GetTodayListQuery';
import { eventBus } from '@/core/event-bus/bus';
import { logger } from '@/core/logger/logger';
import { todayLocalDate } from '@/core/utils/date';

let currentMemberId: string | null = null;

async function updateBadge(): Promise<void> {
  if (!currentMemberId) return;
  if (typeof navigator.setAppBadge !== 'function') return;

  const result = await ask(getTodayListQuery, {
    memberId: currentMemberId,
    date: todayLocalDate(),
  });
  if (!result.ok) return;

  const incomplete = result.value.filter((i) => !i.completed).length;
  try {
    if (incomplete > 0) await navigator.setAppBadge(incomplete);
    else await navigator.clearAppBadge?.();
  } catch (e) {
    logger.warn('badge update failed', { error: String(e) });
  }
}

/** App 啟動時呼叫一次：往後每次 TodayListChanged 都重新計算未完成數。 */
export function startBadgeService(memberId: string): void {
  currentMemberId = memberId;
  eventBus.on('TodayListChanged', () => void updateBadge());
  void updateBadge();
}
