import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { setupCommandPipeline } from '@/application/pipeline/commandPipeline';
import { logger } from '@/core/logger/logger';
import { setupInstallPrompt } from '@/services/pwa/install-prompt';
import { setupServiceWorker } from '@/services/pwa/sw-registration';
import './index.css';

// E8：全域 unhandledrejection
window.addEventListener('unhandledrejection', (e) => {
  logger.error('unhandled rejection', { reason: String(e.reason) });
});

setupCommandPipeline();
setupInstallPrompt();
setupServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
