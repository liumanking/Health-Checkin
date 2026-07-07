import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/app/useAppStore';
import { Card } from '@/design-system/components/Card';
import { Skeleton } from '@/design-system/components/Skeleton';
import { useOrganizeStore } from '../application/useOrganizeStore';
import { ArchivedHabitRow } from './ArchivedHabitRow';
import { CategoryManager } from './CategoryManager';
import { SortableHabitRow } from './SortableHabitRow';
import { TagManager } from './TagManager';
import { TagPickerSheet } from './TagPickerSheet';

export function OrganizePage() {
  const memberId = useAppStore((s) => s.memberId);
  const {
    habits,
    archivedHabits,
    categories,
    tags,
    habitTags,
    loading,
    load,
    reorder,
    remove,
    archive,
    addCategory,
    deleteCategory,
    setHabitCategory,
    addTag,
    deleteTag,
    toggleHabitTag,
  } = useOrganizeStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [tagPickerHabitId, setTagPickerHabitId] = useState<string | null>(null);

  useEffect(() => {
    if (memberId) void load(memberId);
  }, [memberId, load]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!memberId || !over || active.id === over.id) return;
    const oldIndex = habits.findIndex((h) => h.id === active.id);
    const newIndex = habits.findIndex((h) => h.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(habits, oldIndex, newIndex);
    void reorder(memberId, reordered.map((h) => h.id));
  };

  const tagPickerHabit = habits.find((h) => h.id === tagPickerHabitId) ?? null;

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">整理</h1>
        <p className="text-sm text-gray-500">拖曳調整順序，點垃圾桶刪除</p>
      </header>

      {loading ? (
        <>
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </>
      ) : (
        <>
          <CategoryManager
            categories={categories}
            onAdd={(name) => memberId && void addCategory(memberId, name)}
            onDelete={(id) => memberId && void deleteCategory(memberId, id)}
          />

          <TagManager
            tags={tags}
            onAdd={(name) => memberId && void addTag(memberId, name)}
            onDelete={(id) => memberId && void deleteTag(memberId, id)}
          />

          <section className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700">習慣</p>
            {habits.length === 0 ? (
              <Card className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-4xl" aria-hidden>
                  📂
                </p>
                <p className="font-medium text-gray-900">還沒有習慣</p>
              </Card>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
                  <ul className="flex flex-col gap-2">
                    {habits.map((habit) => (
                      <li key={habit.id}>
                        <SortableHabitRow
                          habit={habit}
                          categories={categories}
                          tags={tags}
                          selectedTagIds={habitTags[habit.id] ?? []}
                          onSetCategory={(categoryId) =>
                            memberId && void setHabitCategory(memberId, habit.id, categoryId)
                          }
                          onOpenTags={() => setTagPickerHabitId(habit.id)}
                          onArchive={() => memberId && void archive(memberId, habit.id, true)}
                          onDelete={() => memberId && void remove(memberId, habit.id)}
                        />
                      </li>
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </section>

          {archivedHabits.length > 0 && (
            <section className="flex flex-col gap-2">
              <p className="text-sm font-medium text-gray-700">已封存</p>
              <ul className="flex flex-col gap-2">
                {archivedHabits.map((habit) => (
                  <li key={habit.id}>
                    <ArchivedHabitRow
                      habit={habit}
                      onRestore={() => memberId && void archive(memberId, habit.id, false)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <TagPickerSheet
        habitName={tagPickerHabit?.name ?? null}
        tags={tags}
        selectedTagIds={tagPickerHabit ? (habitTags[tagPickerHabit.id] ?? []) : []}
        onToggle={(tagId, on) =>
          memberId && tagPickerHabit && void toggleHabitTag(memberId, tagPickerHabit.id, tagId, on)
        }
        onClose={() => setTagPickerHabitId(null)}
      />
    </main>
  );
}
