import { registerSW } from 'virtual:pwa-register';
import { logger } from '@/core/logger/logger';

/**
 * Service Worker 註冊（VitePWA / Workbox）。
 * registerType: 'prompt' —— 有新版時交由 update-notify 提示（P0 先 log）。
 */
export function setupServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;

  const updateSW = registerSW({
    onNeedRefresh() {
      // P0：先自動更新；正式的更新提示 UI 於後續 Phase 做
      logger.info('new app version available, updating');
      void updateSW(true);
    },
    onOfflineReady() {
      logger.info('app ready for offline use');
    },
  });
}
