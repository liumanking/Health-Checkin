import { createBrowserRouter } from 'react-router-dom';
import { P0StatusPage } from './P0StatusPage';

/**
 * P0：只有 `/`（狀態頁）。
 * P1 起依設計書 §12 逐步補：/habit/new、/habit/:id、/timer/:id、/stats、
 * /history、/organize、/backup、/settings、/quick-entry、/onboarding。
 */
export const router = createBrowserRouter([{ path: '/', element: <P0StatusPage /> }]);
