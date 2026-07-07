import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { canInstall, onInstallAvailable, promptInstall } from '@/services/pwa/install-prompt';

/** E1：PWA 安裝引導 banner（關閉僅記在本次 session）。 */
export function InstallBanner() {
  const [available, setAvailable] = useState(canInstall());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => onInstallAvailable(setAvailable), []);

  if (!available || dismissed) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-indigo-500 p-3 text-white shadow-sm">
      <Download size={20} className="shrink-0" aria-hidden />
      <p className="flex-1 text-sm">加到主畫面，離線也能用</p>
      <button
        type="button"
        onClick={() => void promptInstall()}
        className="min-h-11 shrink-0 rounded-xl bg-white px-3 text-sm font-semibold text-indigo-600 active:bg-indigo-50"
      >
        安裝
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="關閉安裝提示"
        className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl active:bg-indigo-600"
      >
        <X size={18} aria-hidden />
      </button>
    </div>
  );
}
