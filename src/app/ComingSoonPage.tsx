import { Card } from '@/design-system/components/Card';

interface Props {
  title: string;
  phase: string;
}

/** 尚未到 Phase 的分頁佔位（對應 feature flag = false）。 */
export function ComingSoonPage({ title, phase }: Props) {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-3 p-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </header>
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-4xl" aria-hidden>
          🚧
        </p>
        <p className="font-medium text-gray-900">{phase} 推出</p>
        <p className="text-sm text-gray-500">依路線圖逐階段開放</p>
      </Card>
    </main>
  );
}
