import { z } from 'zod';
import { addHabitCommand } from '@/application/commands/AddHabitCommand';
import type { Command } from '@/core/cqrs/command';
import { idSchema } from '@/domain/entities/base';
import { habitTypeSchema, type Habit } from '@/domain/entities/habit';

const inputSchema = z.object({
  memberId: idSchema,
  name: z.string().min(1),
  emoji: z.string().min(1),
  color: z.string().min(1),
  type: habitTypeSchema,
  unit: z.string().optional(),
  decimal: z.boolean(),
  step: z.number().positive(),
  goalDaily: z.number().positive().optional(),
});

type Input = z.infer<typeof inputSchema>;

/**
 * 從範本快速建立習慣（首次引導用）。schedule 固定 daily。
 * 內部就是 AddHabitCommand，只是輸入來源與命令名稱不同（區分稽核來源）。
 */
export const addFromTemplateCommand: Command<Input, Habit> = {
  name: 'AddFromTemplate',
  input: inputSchema,

  async execute(input) {
    return addHabitCommand.execute({
      memberId: input.memberId,
      name: input.name,
      emoji: input.emoji,
      color: input.color,
      type: input.type,
      unit: input.unit,
      decimal: input.decimal,
      step: input.step,
      schedule: 'daily',
      goalDaily: input.goalDaily,
    });
  },
};
