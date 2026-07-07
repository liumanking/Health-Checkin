import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { StatsPoint } from '@/application/queries/GetPeriodStatsQuery';

interface Props {
  points: StatsPoint[];
  color: string;
  unit?: string;
}

export function TrendChart({ points, color, unit }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={points} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip formatter={(value: number) => [`${value}${unit ?? ''}`, '總量']} />
        <Line type="monotone" dataKey="total" stroke={color} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
