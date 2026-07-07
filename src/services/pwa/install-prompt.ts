/**
 * E1：PWA 安裝引導。攔截 beforeinstallprompt，可安裝時通知訂閱者（Banner UI）。
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(available: boolean) => void>();

function notify(available: boolean): void {
  for (const l of listeners) l(available);
}

export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify(true);
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify(false);
  });
}

/** 訂閱可安裝狀態變化，回傳取消訂閱函式。 */
export function onInstallAvailable(listener: (available: boolean) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function canInstall(): boolean {
  return deferredPrompt !== null;
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  await deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notify(false);
  return choice.outcome;
}
