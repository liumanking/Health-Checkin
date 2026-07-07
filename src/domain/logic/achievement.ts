import type { Achievement } from '@/domain/entities/achievement';

/**
 * 成就評估（預留：P0 只放純函式骨架，完整評估器與 UI 在後續 Phase）。
 * @param metricTotal 對應 metric 的累計值（count 次數 / minutes 分鐘 / distance 距離）
 */
export function isAchievementReached(
  achievement: Pick<Achievement, 'threshold'>,
  metricTotal: number,
): boolean {
  return metricTotal >= achievement.threshold;
}

/** 回傳達標成就的 id 清單。 */
export function evaluateAchievements(
  achievements: ReadonlyArray<Pick<Achievement, 'id' | 'threshold'>>,
  metricTotal: number,
): string[] {
  return achievements.filter((a) => isAchievementReached(a, metricTotal)).map((a) => a.id);
}
