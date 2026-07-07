import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { RouteFallback } from '../RouteFallback';
import { BottomNav } from './BottomNav';

/** 主分頁外框：內容 + 底部導航（內容底部留 nav 高度）。 */
export function AppLayout() {
  return (
    <div className="min-h-dvh bg-gray-50 pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
      <BottomNav />
    </div>
  );
}
