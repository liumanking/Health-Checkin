import type { Habit } from '@/domain/entities/habit';
import type { Log } from '@/domain/entities/log';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** 記錄匯出（CSV）：只含未刪除的 Log，依日期排序。 */
export function logsToCsv(habits: Habit[], logs: Log[]): string {
  const habitNameById = new Map(habits.map((h) => [h.id, h.name]));
  const header = ['date', 'habit', 'amount', 'unit', 'source', 'note'];
  const rows = logs
    .filter((l) => l.deletedAt === undefined)
    .sort((a, b) => (a.date === b.date ? (a.at < b.at ? -1 : 1) : a.date < b.date ? -1 : 1))
    .map((l) => {
      const habit = habits.find((h) => h.id === l.habitId);
      return [
        l.date,
        habitNameById.get(l.habitId) ?? l.habitId,
        String(l.amount),
        habit?.unit ?? '',
        l.source,
        l.note ?? '',
      ];
    });

  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}
