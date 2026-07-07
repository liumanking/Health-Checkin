import { format } from 'date-fns';

/** ISO 8601 精確時間（UTC）。 */
export function nowIso(): string {
  return new Date().toISOString();
}

/** local date："YYYY-MM-DD"（E12：Log.date 一律存 local date）。 */
export function toLocalDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function todayLocalDate(): string {
  return toLocalDate(new Date());
}

/** "YYYY-MM-DD" 加 n 天（n 可為負）。 */
export function addDaysLocal(date: string, n: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toLocalDate(d);
}
