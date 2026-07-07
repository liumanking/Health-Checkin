import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { makeEvent } from '@/core/event-bus/bus';
import { nowIso } from '@/core/utils/date';
import { newId } from '@/core/utils/id';
import { habitRepository } from '@/data/repositories/habit-repository';
import { idSchema, newSyncBase } from '@/domain/entities/base';
import { habitTypeSchema, scheduleSchema, type Habit } from '@/domain/entities/habit';

export const addHabitInputSchema = z.object({
  memberId: idSchema,
  name: z.string().trim().min(1, '請輸入名稱'),
  emoji: z.string().min(1),
  color: z.string().min(1),
  type: habitTypeSchema,
  unit: z.string().optional(),
  decimal: z.boolean(),
  step: z.number().positive(),
  schedule: scheduleSchema,
  goalDaily: z.number().positive().optional(),
  goalWeekly: z.number().positive().optional(),
  goalMonthly: z.number().positive().optional(),
});

type Input = z.infer<typeof addHabitInputSchema>;

/** 新增習慣：order 排在最後。 */
export const addHabitCommand: Command<Input, Habit> = {
  name: 'AddHabit',
  input: addHabitInputSchema,

  async execute(input) {
    const siblings = await habitRepository.search({ memberId: input.memberId });
    const maxOrder = siblings.reduce((m, h) => Math.max(m, h.order), -1);

    const habit: Habit = {
      id: newId(),
      memberId: input.memberId,
      name: input.name,
      emoji: input.emoji,
      color: input.color,
      order: maxOrder + 1,
      archived: false,
      type: input.type,
      unit: input.unit,
      decimal: input.decimal,
      step: input.step,
      schedule: input.schedule,
      goalDaily: input.goalDaily,
      goalWeekly: input.goalWeekly,
      goalMonthly: input.goalMonthly,
      ...newSyncBase(nowIso()),
    };
    await habitRepository.upsert(habit);

    return {
      output: habit,
      events: [makeEvent('TodayListChanged', 'app', { memberId: input.memberId })],
      audits: [
        {
          memberId: input.memberId,
          action: 'create',
          entity: 'habit',
          entityId: habit.id,
          payload: { name: habit.name, type: habit.type },
        },
      ],
    };
  },
};
