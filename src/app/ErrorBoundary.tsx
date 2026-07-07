import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/core/logger/logger';
import { Button } from '@/design-system/components/Button';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** E8：全域 Error Boundary。 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('unhandled render error', { error: error.message, stack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center">
          <p className="text-4xl" aria-hidden>
            😵
          </p>
          <h1 className="text-lg font-semibold text-gray-900">出了點問題</h1>
          <p className="text-sm text-gray-500">{this.state.error.message}</p>
          <Button onClick={() => window.location.reload()}>重新載入</Button>
        </main>
      );
    }
    return this.props.children;
  }
}
