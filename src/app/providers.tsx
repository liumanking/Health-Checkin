import type { ReactNode } from 'react';
import { ToastHost } from '@/design-system/components/Toast';
import { ErrorBoundary } from './ErrorBoundary';

/** 全域 Provider 組合（P0：ErrorBoundary + ToastHost；後續在此疊加）。 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
      <ToastHost />
    </ErrorBoundary>
  );
}
