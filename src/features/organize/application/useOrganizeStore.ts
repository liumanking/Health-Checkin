import { create } from 'zustand';
import { addCategoryCommand } from '@/application/commands/AddCategoryCommand';
import { addTagCommand } from '@/application/commands/AddTagCommand';
import { archiveHabitCommand } from '@/application/commands/ArchiveHabitCommand';
import { deleteCategoryCommand } from '@/application/commands/DeleteCategoryCommand';
import { deleteHabitCommand } from '@/application/commands/DeleteHabitCommand';
import { deleteTagCommand } from '@/application/commands/DeleteTagCommand';
import { reorderHabitsCommand } from '@/application/commands/ReorderHabitsCommand';
import { restoreHabitCommand } from '@/application/commands/RestoreHabitCommand';
import { setHabitCategoryCommand } from '@/application/commands/SetHabitCategoryCommand';
import { toggleHabitTagCommand } from '@/application/commands/ToggleHabitTagCommand';
import { dispatch } from '@/application/pipeline/commandPipeline';
import { ask } from '@/application/pipeline/queryPipeline';
import { getCategoriesQuery } from '@/application/queries/GetCategoriesQuery';
import { getHabitsQuery } from '@/application/queries/GetHabitsQuery';
import { getHabitTagsQuery } from '@/application/queries/GetHabitTagsQuery';
import { getTagsQuery } from '@/application/queries/GetTagsQuery';
import { showToast } from '@/design-system/components/Toast';
import type { Category } from '@/domain/entities/category';
import type { Habit } from '@/domain/entities/habit';
import type { Tag } from '@/domain/entities/tag';

/** 新分類自動配色（不強迫使用者挑色）。 */
const CATEGORY_COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899'];

interface OrganizeStore {
  habits: Habit[];
  archivedHabits: Habit[];
  categories: Category[];
  tags: Tag[];
  /** habitId -> 已勾選的 tagId 集合。 */
  habitTags: Record<string, string[]>;
  loading: boolean;

  load(memberId: string): Promise<void>;
  reorder(memberId: string, orderedHabitIds: string[]): Promise<void>;
  remove(memberId: string, habitId: string): Promise<void>;
  archive(memberId: string, habitId: string, archived: boolean): Promise<void>;
  addCategory(memberId: string, name: string): Promise<void>;
  deleteCategory(memberId: string, categoryId: string): Promise<void>;
  setHabitCategory(memberId: string, habitId: string, categoryId: string | undefined): Promise<void>;
  addTag(memberId: string, name: string): Promise<void>;
  deleteTag(memberId: string, tagId: string): Promise<void>;
  toggleHabitTag(memberId: string, habitId: string, tagId: string, on: boolean): Promise<void>;
}

export const useOrganizeStore = create<OrganizeStore>((set, get) => ({
  habits: [],
  archivedHabits: [],
  categories: [],
  tags: [],
  habitTags: {},
  loading: true,

  async load(memberId) {
    set({ loading: true });
    const [habitsResult, archivedResult, categoriesResult, tagsResult, habitTagsResult] =
      await Promise.all([
        ask(getHabitsQuery, { memberId, archived: false }),
        ask(getHabitsQuery, { memberId, archived: true }),
        ask(getCategoriesQuery, { memberId }),
        ask(getTagsQuery, { memberId }),
        ask(getHabitTagsQuery, undefined),
      ]);

    if (!habitsResult.ok || !categoriesResult.ok || !tagsResult.ok || !habitTagsResult.ok) {
      set({ loading: false });
      showToast('讀取失敗', 'error');
      return;
    }

    const habitIds = new Set(habitsResult.value.map((h) => h.id));
    const habitTags: Record<string, string[]> = {};
    for (const link of habitTagsResult.value) {
      if (!habitIds.has(link.habitId)) continue;
      (habitTags[link.habitId] ??= []).push(link.tagId);
    }

    set({
      habits: habitsResult.value,
      archivedHabits: archivedResult.ok ? archivedResult.value : [],
      categories: categoriesResult.value,
      tags: tagsResult.value,
      habitTags,
      loading: false,
    });
  },

  async reorder(memberId, orderedHabitIds) {
    const previous = get().habits;
    // 樂觀更新：拖曳當下先照新順序顯示，失敗再復原。
    const reordered = orderedHabitIds
      .map((id) => previous.find((h) => h.id === id))
      .filter((h): h is Habit => h !== undefined);
    set({ habits: reordered });

    const result = await dispatch(reorderHabitsCommand, { memberId, orderedHabitIds });
    if (!result.ok) {
      set({ habits: previous });
      showToast(result.error.message, 'error');
    }
  },

  async remove(memberId, habitId) {
    const previous = get().habits;
    const habit = previous.find((h) => h.id === habitId);
    if (!habit) return;
    set({ habits: previous.filter((h) => h.id !== habitId) });

    const result = await dispatch(deleteHabitCommand, { habitId, memberId });
    if (!result.ok) {
      set({ habits: previous });
      showToast(result.error.message, 'error');
      return;
    }

    showToast(`已刪除「${habit.name}」`, 'info', {
      label: '復原',
      onClick: () => {
        void dispatch(restoreHabitCommand, { habitId, memberId }).then((restoreResult) => {
          if (restoreResult.ok) void get().load(memberId);
          else showToast(restoreResult.error.message, 'error');
        });
      },
    });
  },

  async archive(memberId, habitId, archived) {
    const result = await dispatch(archiveHabitCommand, { habitId, memberId, archived });
    if (!result.ok) {
      showToast(result.error.message, 'error');
      return;
    }
    showToast(archived ? '已封存' : '已取消封存', 'success');
    await get().load(memberId);
  },

  async addCategory(memberId, name) {
    const color = CATEGORY_COLORS[get().categories.length % CATEGORY_COLORS.length];
    const result = await dispatch(addCategoryCommand, { memberId, name, color });
    if (!result.ok) {
      showToast(result.error.message, 'error');
      return;
    }
    set({ categories: [...get().categories, result.value] });
  },

  async deleteCategory(memberId, categoryId) {
    const previous = get().categories;
    set({ categories: previous.filter((c) => c.id !== categoryId) });
    const result = await dispatch(deleteCategoryCommand, { categoryId, memberId });
    if (!result.ok) {
      set({ categories: previous });
      showToast(result.error.message, 'error');
      return;
    }
    await get().load(memberId);
  },

  async setHabitCategory(memberId, habitId, categoryId) {
    const previous = get().habits;
    set({
      habits: previous.map((h) => (h.id === habitId ? { ...h, categoryId } : h)),
    });
    const result = await dispatch(setHabitCategoryCommand, { habitId, memberId, categoryId });
    if (!result.ok) {
      set({ habits: previous });
      showToast(result.error.message, 'error');
    }
  },

  async addTag(memberId, name) {
    const result = await dispatch(addTagCommand, { memberId, name });
    if (!result.ok) {
      showToast(result.error.message, 'error');
      return;
    }
    set({ tags: [...get().tags, result.value] });
  },

  async deleteTag(memberId, tagId) {
    const previous = get().tags;
    set({ tags: previous.filter((t) => t.id !== tagId) });
    const result = await dispatch(deleteTagCommand, { tagId, memberId });
    if (!result.ok) {
      set({ tags: previous });
      showToast(result.error.message, 'error');
      return;
    }
    await get().load(memberId);
  },

  async toggleHabitTag(memberId, habitId, tagId, on) {
    const previous = get().habitTags;
    const current = previous[habitId] ?? [];
    set({
      habitTags: {
        ...previous,
        [habitId]: on ? [...current, tagId] : current.filter((id) => id !== tagId),
      },
    });
    const result = await dispatch(toggleHabitTagCommand, { habitId, memberId, tagId, on });
    if (!result.ok) {
      set({ habitTags: previous });
      showToast(result.error.message, 'error');
    }
  },
}));
