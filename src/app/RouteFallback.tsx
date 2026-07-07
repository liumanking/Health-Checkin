import { Skeleton } from '@/design-system/components/Skeleton';

/** 路由 lazy() 載入中的最小佔位（避免整頁閃爍成空白）。 */
export function RouteFallback() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-3 p-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-20" />
      <Skeleton className="h-20" />
    </main>
  );
}
