import { z } from 'zod';
import type { Command } from '@/core/cqrs/command';
import { NotFoundError, ValidationError } from '@/core/errors/app-error';
import { makeEvent } from '@/core/event-bus/bus';
import { habitRepository } from '@/data/repositories/habit-repository';
import { idSchema } from '@/domain/entities/base';
import { scheduleSchema, type Habit } from '@/domain/entities/habit';

/**
 * 編輯習慣。type 不可改（既有 Log 語意會亂掉）；goal 欄位省略即清除。
 */
export const updateHabitInputSchema = z.object({
  id: idSchema,
  memberId: idSchema,
  name: z.string().trim().min(1, '請輸入名稱'),
  emoji: z.string().min(1),
  color: z.string().min(1),
  unit: z.string().optional(),
  decimal: z.boolean(),
  step: z.number().positive(),
  schedule: scheduleSchema,
  goalDaily: z.number().positive().optional(),
  goalWeekly: z.number().positive().optional(),
  goalMonthly: z.number().positive().optional(),
});

type Input = z.infer<typeof updateHabitInputSchema>;

export const updateHabitCommand: Command<Input, Habit> = {
  name: 'UpdateHabit',
  input: updateHabitInputSchema,

  async execute(input) {
    const existing = await habitRepository.getById(input.id);
    if (!existing) throw new NotFoundError('habit', input.id);
    if (existing.memberId !== input.memberId)
      throw new ValidationError('習慣不屬於此成員');

    const next: Habit = {
      ...existing,
      name: input.name,
      emoji: input.emoji,
      color: input.color,
      unit: input.unit,
      decimal: input.decimal,
      step: input.step,
      schedule: input.schedule,
      goalDaily: input.goalDaily,
      goalWeekly: input.goalWeekly,
      goalMonthly: input.goalMonthly,
    };
    await habitRepository.upsert(next);

    return {
      output: next,
      events: [makeEvent('TodayListChanged', 'app', { memberId: input.memberId })],
      audits: [
        {
          memberId: input.memberId,
          action: 'update',
          entity: 'habit',
          entityId: next.id,
          payload: { name: next.name },
        },
      ],
    };
  },
};
