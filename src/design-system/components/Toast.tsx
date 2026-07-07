import { useEffect, useState } from 'react';

export type ToastKind = 'info' | 'success' | 'error';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
  /** P4 起：刪除後 Toast Undo 用。 */
  action?: { label: string; onClick: () => void };
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function notify(): void {
  for (const l of listeners) l(toasts);
}

/** 任意處呼叫（含非 React 程式碼）。 */
export function showToast(
  message: string,
  kind: ToastKind = 'info',
  action?: ToastItem['action'],
): void {
  const item: ToastItem = { id: nextId++, kind, message, action };
  toasts = [...toasts, item];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== item.id);
    notify();
  }, 4000);
}

const kindClass: Record<ToastKind, string> = {
  info: 'bg-gray-800 text-white',
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
};

/** 掛在 App root 的 Toast 容器。 */
export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4"
    >
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex min-h-11 w-full max-w-sm items-center justify-between gap-3 rounded-xl px-4 py-2 shadow-lg ${kindClass[t.kind]}`}
        >
          <span className="text-sm">{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="min-h-11 shrink-0 px-2 text-sm font-semibold underline"
              onClick={t.action.onClick}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
