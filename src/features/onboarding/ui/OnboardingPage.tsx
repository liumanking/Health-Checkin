import { Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFromTemplateCommand } from '@/application/commands/AddFromTemplateCommand';
import { dispatch } from '@/application/pipeline/commandPipeline';
import { useAppStore } from '@/app/useAppStore';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { showToast } from '@/design-system/components/Toast';
import { ONBOARDING_TEMPLATES } from '../onboarding-templates';

export function OnboardingPage() {
  const navigate = useNavigate();
  const memberId = useAppStore((s) => s.memberId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const start = async () => {
    if (!memberId || selected.size === 0) return;
    setSaving(true);
    const chosen = ONBOARDING_TEMPLATES.filter((t) => selected.has(t.id));
    for (const template of chosen) {
      const result = await dispatch(addFromTemplateCommand, {
        memberId,
        name: template.name,
        emoji: template.emoji,
        color: template.color,
        type: template.type,
        unit: template.unit,
        decimal: template.decimal,
        step: template.step,
        goalDaily: template.goalDaily,
      });
      if (!result.ok) showToast(result.error.message, 'error');
    }
    setSaving(false);
    navigate('/');
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 bg-gray-50 p-4">
      <header className="pt-4 text-center">
        <p className="text-4xl" aria-hidden>
          🌱
        </p>
        <h1 className="mt-2 text-xl font-bold text-gray-900">歡迎使用習慣追蹤器</h1>
        <p className="mt-1 text-sm text-gray-500">先挑幾個想養成的習慣，之後隨時可以編輯或新增</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {ONBOARDING_TEMPLATES.map((t) => {
          const checked = selected.has(t.id);
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={checked}
              onClick={() => toggle(t.id)}
              className="text-left"
            >
              <Card
                className={`relative flex flex-col items-center gap-1 py-4 ${
                  checked ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                {checked && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                    <Check size={12} aria-hidden />
                  </span>
                )}
                <span className="text-3xl" aria-hidden>
                  {t.emoji}
                </span>
                <span className="font-medium text-gray-900">{t.name}</span>
                <span className="text-xs text-gray-500">
                  {t.type === 'check' ? '打卡' : t.type === 'count' ? '計量' : '計時'}
                  {t.goalDaily ? ` · 每日 ${t.goalDaily}${t.unit ?? ''}` : ''}
                </span>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2 pb-4">
        <Button block disabled={selected.size === 0 || saving} onClick={() => void start()}>
          {saving ? '建立中…' : `開始使用（已選 ${selected.size} 個）`}
        </Button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="min-h-11 text-center text-sm text-gray-500"
        >
          略過，稍後自己建立
        </button>
      </div>
    </main>
  );
}
