import { useEffect, useState } from 'react';
import type { TodayItem } from '@/application/queries/GetTodayListQuery';
import { BottomSheet } from '@/design-system/components/BottomSheet';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

interface Props {
  item: TodayItem | null; // null = 關閉
  onClose: () => void;
  onRecord: (amount: number) => void;
}

/** 計量自訂數量輸入（快速鍵：±step）。 */
export function QuickActions({ item, onClose, onRecord }: Props) {
  const [value, setValue] = useState('');
  const habit = item?.habit;

  useEffect(() => {
    if (item) setValue(String(item.habit.step));
  }, [item]);

  if (!habit) return null;

  const parsed = Number(value);
  const valid =
    value.trim() !== '' &&
    Number.isFinite(parsed) &&
    parsed > 0 &&
    (habit.decimal || Number.isInteger(parsed));

  const bump = (delta: number) => {
    const next = Math.max(habit.step, (Number(value) || 0) + delta);
    setValue(habit.decimal ? String(Math.round(next * 10) / 10) : String(Math.round(next)));
  };

  const submit = () => {
    if (!valid) return;
    onRecord(parsed);
    onClose();
  };

  return (
    <BottomSheet open={item !== null} title={`記錄 ${habit.emoji} ${habit.name}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-2">
          <Button variant="secondary" onClick={() => bump(-habit.step)} aria-label="減少">
            −
          </Button>
          <div className="flex-1">
            <Input
              label={`數量${habit.unit ? `（${habit.unit}）` : ''}`}
              type="number"
              inputMode={habit.decimal ? 'decimal' : 'numeric'}
              step={habit.decimal ? 0.1 : 1}
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              error={value !== '' && !valid ? (habit.decimal ? '請輸入大於 0 的數字' : '請輸入大於 0 的整數') : undefined}
            />
          </div>
          <Button variant="secondary" onClick={() => bump(habit.step)} aria-label="增加">
            ＋
          </Button>
        </div>
        <Button block disabled={!valid} onClick={submit}>
          記錄
        </Button>
      </div>
    </BottomSheet>
  );
}
