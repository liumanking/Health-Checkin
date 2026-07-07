import { useEffect, useState } from 'react';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Input } from './Input';

interface Props {
  open: boolean;
  habitName: string;
  habitEmoji: string;
  unit?: string;
  step: number;
  decimal: boolean;
  onClose: () => void;
  onRecord: (amount: number) => void;
}

/** 通用數量輸入（快速鍵：±step）；今日記錄／補登共用。 */
export function AmountEntrySheet({
  open,
  habitName,
  habitEmoji,
  unit,
  step,
  decimal,
  onClose,
  onRecord,
}: Props) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) setValue(String(step));
  }, [open, step]);

  const parsed = Number(value);
  const valid =
    value.trim() !== '' && Number.isFinite(parsed) && parsed > 0 && (decimal || Number.isInteger(parsed));

  const bump = (delta: number) => {
    const next = Math.max(step, (Number(value) || 0) + delta);
    setValue(decimal ? String(Math.round(next * 10) / 10) : String(Math.round(next)));
  };

  const submit = () => {
    if (!valid) return;
    onRecord(parsed);
    onClose();
  };

  return (
    <BottomSheet open={open} title={`記錄 ${habitEmoji} ${habitName}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-2">
          <Button variant="secondary" onClick={() => bump(-step)} aria-label="減少">
            −
          </Button>
          <div className="flex-1">
            <Input
              label={`數量${unit ? `（${unit}）` : ''}`}
              type="number"
              inputMode={decimal ? 'decimal' : 'numeric'}
              step={decimal ? 0.1 : 1}
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              error={value !== '' && !valid ? (decimal ? '請輸入大於 0 的數字' : '請輸入大於 0 的整數') : undefined}
            />
          </div>
          <Button variant="secondary" onClick={() => bump(step)} aria-label="增加">
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
