/**
 * HabitQuery specification（架構原則 5）：
 * Repository 對外只有 search(Query)，不長 getByXxx()。
 */
export interface HabitQuery {
  memberId?: string;
  archived?: boolean;
  categoryId?: string;
  type?: 'check' | 'count' | 'timer';
  /** 名稱模糊搜尋（不分大小寫）。 */
  search?: string;
  /** 預設 false：一律過濾 deletedAt !== undefined。 */
  includeDeleted?: boolean;
}
