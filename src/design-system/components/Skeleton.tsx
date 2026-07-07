export interface SkeletonProps {
  className?: string;
}

/** E9：頁面載入佔位。 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}
