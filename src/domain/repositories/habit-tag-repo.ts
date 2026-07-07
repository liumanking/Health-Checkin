import type { HabitTag } from '@/domain/entities/tag';

/**
 * Habit↔Tag 多對多關聯（無 SyncBase，整筆增刪，鐵律 11 之外的特例）。
 * P0 資料量小：listAll 後於記憶體依 habitId 分組即可。
 */
export interface HabitTagRepository {
  listAll(): Promise<HabitTag[]>;
  listByHabit(habitId: string): Promise<HabitTag[]>;
  add(habitId: string, tagId: string): Promise<void>;
  remove(habitId: string, tagId: string): Promise<void>;
}
