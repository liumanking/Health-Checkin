import { useEffect, useState } from 'react';
import { appConfig } from '@/config/app-config';
import { DB_SCHEMA_VERSION } from '@/config/db-config';
import { featureFlags } from '@/core/feature-flags/flags';
import { db } from '@/data/db/database';
import { Card } from '@/design-system/components/Card';
import { Skeleton } from '@/design-system/components/Skeleton';

/**
 * P0 驗證頁（暫代主畫面）：確認 Dexie 開得起來、各層接得通。
 * P1 起由 features/today 的 TodayPage 取代。
 */
export function P0StatusPage() {
  const [dbState, setDbState] = useState<'opening' | 'ok' | 'error'>('opening');
  const [tableCount, setTableCount] = useState(0);

  useEffect(() => {
    db.open()
      .then(() => {
        setTableCount(db.tables.length);
        setDbState('ok');
      })
      .catch(() => setDbState('error'));
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 bg-gray-50 p-4">
      <header className="pt-4">
        <h1 className="text-2xl font-bold text-gray-900">習慣追蹤器</h1>
        <p className="text-sm text-gray-500">
          P0 骨架 · v{appConfig.appVersion} · {appConfig.env}
        </p>
      </header>

      {dbState === 'opening' ? (
        <Skeleton className="h-24" />
      ) : (
        <Card>
          <h2 className="mb-2 font-semibold text-gray-900">IndexedDB</h2>
          {dbState === 'ok' ? (
            <p className="text-sm text-gray-600">
              ✅ Dexie schema v{DB_SCHEMA_VERSION} 開啟成功，共 {tableCount} 張表
            </p>
          ) : (
            <p className="text-sm text-red-500">❌ 資料庫開啟失敗</p>
          )}
        </Card>
      )}

      <Card>
        <h2 className="mb-2 font-semibold text-gray-900">Feature Flags</h2>
        <ul className="grid grid-cols-2 gap-1 text-sm text-gray-600">
          {Object.entries(featureFlags).map(([name, on]) => (
            <li key={name}>
              {on ? '🟢' : '⚪'} {name}
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-auto pb-4 text-center text-xs text-gray-400">
        P1 起此頁由 Today 主畫面取代
      </p>
    </main>
  );
}
