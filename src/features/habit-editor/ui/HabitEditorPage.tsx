import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addHabitCommand } from '@/application/commands/AddHabitCommand';
import { updateHabitCommand } from '@/application/commands/UpdateHabitCommand';
import { dispatch } from '@/application/pipeline/commandPipeline';
import { ask } from '@/application/pipeline/queryPipeline';
import { getHabitDetailQuery } from '@/application/queries/GetHabitDetailQuery';
import { useAppStore } from '@/app/useAppStore';
import type { HabitType, Schedule } from '@/domain/entities/habit';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Input } from '@/design-system/components/Input';
import { Skeleton } from '@/design-system/components/Skeleton';
import { showToast } from '@/design-system/components/Toast';
import { ReminderSection } from './ReminderSection';

const EMOJI_PRESETS = ['💧', '🏃', '📖', '🧘', '💪', '😴', '🥗', '🚶', '🦷', '☀️', '✍️', '🎯'];
const COLOR_PRESETS = ['#6366f1', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#64748b'];

const TYPE_OPTIONS: { value: HabitType; label: string; hint: string }[] = [
  { value: 'check', label: '打卡', hint: '做了就打勾' },
  { value: 'count', label: '計量', hint: '記錄數量' },
  { value: 'timer', label: '計時', hint: '記錄時間（P2）' },
];

interface FormState {
  name: string;
  emoji: string;
  color: string;
  type: HabitType;
  unit: string;
  decimal: boolean;
  step: string;
  schedule: Schedule;
  goalDaily: string;
  goalWeekly: string;
  goalMonthly: string;
}

const DEFAULT_FORM: FormState = {
  name: '',
  emoji: '💧',
  color: '#6366f1',
  type: 'check',
  unit: '',
  decimal: false,
  step: '1',
  schedule: 'daily',
  goalDaily: '',
  goalWeekly: '',
  goalMonthly: '',
};

/** type 切換時帶入常用預設。 */
function defaultsForType(type: HabitType): Partial<FormState> {
  switch (type) {
    case 'check':
      return { type, unit: '', step: '1', decimal: false };
    case 'count':
      return { type, unit: '次', step: '1' };
    case 'timer':
      return { type, unit: '分鐘', step: '5', decimal: false };
  }
}

function numOrUndefined(s: string): number | undefined {
  const n = Number(s);
  return s.trim() !== '' && Number.isFinite(n) && n > 0 ? n : undefined;
}

export function HabitEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined;
  const memberId = useAppStore((s) => s.memberId);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string>();

  useEffect(() => {
    if (!isEdit) return;
    void ask(getHabitDetailQuery, { habitId: id }).then((result) => {
      if (result.ok && result.value) {
        const h = result.value;
        setForm({
          name: h.name,
          emoji: h.emoji,
          color: h.color,
          type: h.type,
          unit: h.unit ?? '',
          decimal: h.decimal,
          step: String(h.step),
          schedule: h.schedule,
          goalDaily: h.goalDaily !== undefined ? String(h.goalDaily) : '',
          goalWeekly: h.goalWeekly !== undefined ? String(h.goalWeekly) : '',
          goalMonthly: h.goalMonthly !== undefined ? String(h.goalMonthly) : '',
        });
        setLoading(false);
      } else {
        showToast('找不到這個習慣', 'error');
        navigate('/');
      }
    });
  }, [isEdit, id, navigate]);

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));
  const showAmountFields = form.type !== 'check';

  const submit = async () => {
    if (!memberId) return;
    if (form.name.trim() === '') {
      setNameError('請輸入名稱');
      return;
    }
    setSaving(true);

    const common = {
      memberId,
      name: form.name,
      emoji: form.emoji,
      color: form.color,
      unit: form.type === 'check' ? undefined : form.unit.trim() || undefined,
      decimal: form.type === 'count' ? form.decimal : false,
      step: numOrUndefined(form.step) ?? 1,
      schedule: form.schedule,
      goalDaily: numOrUndefined(form.goalDaily),
      goalWeekly: numOrUndefined(form.goalWeekly),
      goalMonthly: numOrUndefined(form.goalMonthly),
    };

    const result = isEdit
      ? await dispatch(updateHabitCommand, { ...common, id })
      : await dispatch(addHabitCommand, { ...common, type: form.type });

    setSaving(false);
    if (result.ok) {
      showToast(isEdit ? '已更新' : '已建立', 'success');
      navigate('/');
    } else {
      showToast(result.error.message, 'error');
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 bg-gray-50 p-4">
      <header className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="返回"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 active:bg-gray-100"
        >
          <ArrowLeft size={22} aria-hidden />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{isEdit ? '編輯習慣' : '新增習慣'}</h1>
      </header>

      {loading ? (
        <>
          <Skeleton className="h-24" />
          <Skeleton className="h-40" />
        </>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Card className="flex flex-col gap-4">
            <Input
              label="名稱"
              value={form.name}
              onChange={(e) => {
                set({ name: e.target.value });
                setNameError(undefined);
              }}
              placeholder="例如：喝水"
              error={nameError}
              autoFocus={!isEdit}
            />

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-gray-700">圖示</legend>
              <div className="grid grid-cols-6 gap-1.5">
                {EMOJI_PRESETS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => set({ emoji: e })}
                    aria-pressed={form.emoji === e}
                    className={`flex min-h-11 items-center justify-center rounded-xl text-xl ${
                      form.emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-gray-700">顏色</legend>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set({ color: c })}
                    aria-label={`顏色 ${c}`}
                    aria-pressed={form.color === c}
                    className={`min-h-11 min-w-11 rounded-full ${
                      form.color === c ? 'ring-2 ring-gray-900 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </fieldset>
          </Card>

          <Card className="flex flex-col gap-4">
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-gray-700">類型</legend>
              <div className="grid grid-cols-3 gap-1.5" role="radiogroup">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={form.type === opt.value}
                    disabled={isEdit && form.type !== opt.value}
                    onClick={() => set(defaultsForType(opt.value))}
                    className={`flex min-h-11 flex-col items-center justify-center rounded-xl px-2 py-2 text-sm ${
                      form.type === opt.value
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-700 disabled:opacity-40'
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    <span className={form.type === opt.value ? 'text-indigo-100' : 'text-gray-400'}>
                      {opt.hint}
                    </span>
                  </button>
                ))}
              </div>
              {isEdit && <p className="mt-1 text-xs text-gray-400">類型建立後不可更改</p>}
            </fieldset>

            {showAmountFields && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="單位"
                  value={form.unit}
                  onChange={(e) => set({ unit: e.target.value })}
                  placeholder="次、杯、公里…"
                />
                <Input
                  label="每次增量"
                  type="number"
                  inputMode={form.decimal ? 'decimal' : 'numeric'}
                  min={0}
                  step={form.decimal ? 0.1 : 1}
                  value={form.step}
                  onChange={(e) => set({ step: e.target.value })}
                />
              </div>
            )}

            {form.type === 'count' && (
              <label className="flex min-h-11 items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.decimal}
                  onChange={(e) => set({ decimal: e.target.checked })}
                  className="h-5 w-5 rounded accent-indigo-500"
                />
                允許小數（例如 1.5 公里）
              </label>
            )}

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-gray-700">排程</legend>
              <div className="grid grid-cols-2 gap-1.5" role="radiogroup">
                {(
                  [
                    { value: 'daily', label: '每天' },
                    { value: 'anytime', label: '隨時' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={form.schedule === opt.value}
                    onClick={() => set({ schedule: opt.value })}
                    className={`min-h-11 rounded-xl text-sm font-medium ${
                      form.schedule === opt.value
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </Card>

          <Card className="flex flex-col gap-3">
            <p className="text-sm font-medium text-gray-700">目標（選填）</p>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="每日"
                type="number"
                inputMode="decimal"
                min={0}
                value={form.goalDaily}
                onChange={(e) => set({ goalDaily: e.target.value })}
                placeholder="—"
              />
              <Input
                label="每週"
                type="number"
                inputMode="decimal"
                min={0}
                value={form.goalWeekly}
                onChange={(e) => set({ goalWeekly: e.target.value })}
                placeholder="—"
              />
              <Input
                label="每月"
                type="number"
                inputMode="decimal"
                min={0}
                value={form.goalMonthly}
                onChange={(e) => set({ goalMonthly: e.target.value })}
                placeholder="—"
              />
            </div>
          </Card>

          {id && memberId && <ReminderSection habitId={id} memberId={memberId} />}

          <Button type="submit" block disabled={saving}>
            {saving ? '儲存中…' : isEdit ? '儲存變更' : '建立習慣'}
          </Button>
        </form>
      )}
    </main>
  );
}
