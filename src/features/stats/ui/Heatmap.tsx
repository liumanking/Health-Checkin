import { getDay } from 'date-fns';
import type { HeatmapCell } from '@/application/queries/GetHeatmapQuery';

const LEVEL_COLOR: Record<HeatmapCell['level'], string> = {
  0: '#e5e7eb', // gray-200：沒記錄
  1: '#c7d2fe', // indigo-200：未達標
  2: '#818cf8', // indigo-400：達標
  3: '#4f46e5', // indigo-600：超額達標
};

interface Props {
  cells: HeatmapCell[];
}

/** GitHub 風格熱力圖：每欄一週，Sun 到 Sat 由上到下。 */
export function Heatmap({ cells }: Props) {
  if (cells.length === 0) return null;

  const leadingPad = getDay(new Date(`${cells[0].date}T00:00:00`));
  const padded: (HeatmapCell | null)[] = [
    ...Array.from({ length: leadingPad }, () => null),
    ...cells,
  ];
  const weeks: (HeatmapCell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  const cellSize = 11;
  const gap = 3;
  const width = weeks.length * (cellSize + gap);
  const height = 7 * (cellSize + gap);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label="完成熱力圖（近 91 天）">
      {weeks.map((week, wi) =>
        week.map((cell, di) =>
          cell ? (
            <rect
              key={`${wi}-${di}`}
              x={wi * (cellSize + gap)}
              y={di * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              rx={2}
              fill={LEVEL_COLOR[cell.level]}
            >
              <title>{`${cell.date}：${cell.total}`}</title>
            </rect>
          ) : null,
        ),
      )}
    </svg>
  );
}
