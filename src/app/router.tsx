import { createBrowserRouter } from 'react-router-dom';
import { HabitEditorPage } from '@/features/habit-editor/ui/HabitEditorPage';
import { TodayPage } from '@/features/today/ui/TodayPage';
import { ComingSoonPage } from './ComingSoonPage';
import { AppLayout } from './layout/AppLayout';

/**
 * P1：Today + 編輯器 + 4 tabs（stats/organize/settings 佔位）。
 * 後續依設計書 §12 補：/habit/:id、/timer/:id、/history、/backup、
 * /quick-entry、/onboarding。
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <TodayPage /> },
      { path: '/stats', element: <ComingSoonPage title="統計" phase="P3" /> },
      { path: '/organize', element: <ComingSoonPage title="整理" phase="P4" /> },
      { path: '/settings', element: <ComingSoonPage title="設定" phase="P8 前後" /> },
    ],
  },
  { path: '/habit/new', element: <HabitEditorPage /> },
  { path: '/habit/:id/edit', element: <HabitEditorPage /> },
]);
