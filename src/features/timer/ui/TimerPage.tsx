import { ArrowLeft, Pause, Play, Square, X } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/app/useAppStore';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { Skeleton } from '@/design-system/components/Skeleton';
import { syncTimerWorker } from '@/services/timer-worker/timer-bridge';
import { useTimerStore } from '../application/useTimerStore';

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function TimerPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const memberId = useAppStore((s) => s.memberId);
  const { habit, session, elapsedMs, loading, load, start, pause, stop, cancel, leave } =
    useTimerStore();

  useEffect(() => {
    if (id && memberId) void load(id, memberId);
    return () => leave();
  }, [id, memberId, load, leave]);

  useEffect(() => {
    if (!session || session.status !== 'running') return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncTimerWorker(session.id);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [session]);

  const running = session?.status === 'running';
  const paused = session?.status === 'paused';

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 bg-gray-50 p-4">
      <header className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="返回"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-gray-600 active:bg-gray-100"
        >
          <ArrowLeft size={22} aria-hidden />
        </button>
        <h1 className="text-xl font-bold text-gray-900">計時</h1>
      </header>

      {loading || !habit ? (
        <Skeleton className="h-64" />
      ) : (
        <>
          <Card className="flex flex-col items-center gap-2 py-10">
            <span className="text-3xl" aria-hidden>
              {habit.emoji}
            </span>
            <p className="font-medium text-gray-900">{habit.name}</p>
            <p
              className="mt-4 font-mono text-5xl font-bold tabular-nums text-gray-900"
              aria-live="polite"
            >
              {formatElapsed(elapsedMs)}
            </p>
            {paused && <p className="text-sm text-gray-500">已暫停</p>}
          </Card>

          <div className="flex flex-col gap-3">
            {!session || session.status === 'completed' || session.status === 'cancelled' ? (
              <Button block onClick={() => memberId && void start(memberId)}>
                <Play size={18} aria-hidden />
                開始
              </Button>
            ) : (
              <>
                <div className="flex gap-3">
                  {running ? (
                    <Button
                      variant="secondary"
                      block
                      onClick={() => memberId && void pause(memberId)}
                    >
                      <Pause size={18} aria-hidden />
                      暫停
                    </Button>
                  ) : (
                    <Button block onClick={() => memberId && void start(memberId)}>
                      <Play size={18} aria-hidden />
                      繼續
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    block
                    onClick={() => memberId && void stop(memberId)}
                  >
                    <Square size={18} aria-hidden />
                    完成
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  block
                  onClick={() => memberId && void cancel(memberId)}
                >
                  <X size={18} aria-hidden />
                  捨棄這次
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </main>
  );
}
