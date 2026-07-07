import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { RouteFallback } from './RouteFallback';

/**
 * 路由層 code-split：每頁各自獨立 chunk，需要時才下載
 * （效能優化：Stats 頁帶 Recharts，是目前 bundle 最大宗，拆開後不影響其他頁的初始載入）。
 */
const TodayPage = lazy(() =>
  import('@/features/today/ui/TodayPage').then((m) => ({ default: m.TodayPage })),
);
const StatsPage = lazy(() =>
  import('@/features/stats/ui/StatsPage').then((m) => ({ default: m.StatsPage })),
);
const OrganizePage = lazy(() =>
  import('@/features/organize/ui/OrganizePage').then((m) => ({ default: m.OrganizePage })),
);
const BackupPage = lazy(() =>
  import('@/features/backup/ui/BackupPage').then((m) => ({ default: m.BackupPage })),
);
const HabitEditorPage = lazy(() =>
  import('@/features/habit-editor/ui/HabitEditorPage').then((m) => ({
    default: m.HabitEditorPage,
  })),
);
const TimerPage = lazy(() =>
  import('@/features/timer/ui/TimerPage').then((m) => ({ default: m.TimerPage })),
);
const HistoryPage = lazy(() =>
  import('@/features/history/ui/HistoryPage').then((m) => ({ default: m.HistoryPage })),
);
const QuickEntryPage = lazy(() =>
  import('@/features/today/ui/QuickEntryPage').then((m) => ({ default: m.QuickEntryPage })),
);
const OnboardingPage = lazy(() =>
  import('@/features/onboarding/ui/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);

/** 獨立路由（不在 AppLayout 底下，沒有共用的 Suspense 邊界）各自包一層。 */
function standalone(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

/**
 * P8：Today + 編輯器 + 計時 + 統計 + 補登 + 整理 + 提醒 + 快速記錄 + 範本引導 + 備份還原。
 * 設定頁目前內容＝備份還原（P8 前後合併，尚無其他設定項）。
 * 後續依設計書 §12 補：/habit/:id。
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <TodayPage /> },
      { path: '/stats', element: <StatsPage /> },
      { path: '/organize', element: <OrganizePage /> },
      { path: '/settings', element: <BackupPage /> },
    ],
  },
  { path: '/habit/new', element: standalone(<HabitEditorPage />) },
  { path: '/habit/:id/edit', element: standalone(<HabitEditorPage />) },
  { path: '/timer/:id', element: standalone(<TimerPage />) },
  { path: '/history', element: standalone(<HistoryPage />) },
  { path: '/quick-entry', element: standalone(<QuickEntryPage />) },
  { path: '/onboarding', element: standalone(<OnboardingPage />) },
]);
