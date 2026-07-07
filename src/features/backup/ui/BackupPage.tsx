import { Download, FileJson, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { importDataCommand } from '@/application/commands/ImportDataCommand';
import { dispatch } from '@/application/pipeline/commandPipeline';
import { ask } from '@/application/pipeline/queryPipeline';
import { getExportDataQuery } from '@/application/queries/GetExportDataQuery';
import { useAppStore } from '@/app/useAppStore';
import { logsToCsv } from '@/data/export/csv-export';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { showToast } from '@/design-system/components/Toast';
import { shareOrDownloadFile } from '@/services/export/file-download';
import { todayLocalDate } from '@/core/utils/date';

export function BackupPage() {
  const memberId = useAppStore((s) => s.memberId);
  const [busy, setBusy] = useState<'json' | 'csv' | 'import' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function exportJson() {
    setBusy('json');
    const result = await ask(getExportDataQuery, undefined);
    setBusy(null);
    if (!result.ok) {
      showToast('匯出失敗', 'error');
      return;
    }
    await shareOrDownloadFile(
      `habit-tracker-backup-${todayLocalDate()}.json`,
      JSON.stringify(result.value, null, 2),
      'application/json',
    );
  }

  async function exportCsv() {
    setBusy('csv');
    const result = await ask(getExportDataQuery, undefined);
    setBusy(null);
    if (!result.ok) {
      showToast('匯出失敗', 'error');
      return;
    }
    const csv = logsToCsv(result.value.data.habits, result.value.data.logs);
    await shareOrDownloadFile(`habit-tracker-logs-${todayLocalDate()}.csv`, csv, 'text/csv');
  }

  function pickImportFile() {
    fileInputRef.current?.click();
  }

  async function onImportFile(file: File) {
    if (!memberId) return;
    setBusy('import');
    try {
      const text = await file.text();
      const raw: unknown = JSON.parse(text);
      const result = await dispatch(importDataCommand, { memberId, raw });
      if (result.ok) {
        const s = result.value;
        showToast(
          `已還原：${s.habits} 個習慣、${s.logs} 筆記錄`,
          'success',
        );
      } else {
        showToast(result.error.message, 'error');
      }
    } catch {
      showToast('檔案格式錯誤，無法解析', 'error');
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-3 p-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
      </header>

      <Card className="flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-700">資料備份與還原</p>
        <p className="text-xs text-gray-500">
          JSON 是完整備份（可還原全部資料），CSV 只含打卡/計量/計時記錄，方便匯入試算表。
        </p>

        <Button variant="secondary" block disabled={busy !== null} onClick={() => void exportJson()}>
          <FileJson size={18} aria-hidden />
          {busy === 'json' ? '匯出中…' : '匯出 JSON（完整備份）'}
        </Button>

        <Button variant="secondary" block disabled={busy !== null} onClick={() => void exportCsv()}>
          <Download size={18} aria-hidden />
          {busy === 'csv' ? '匯出中…' : '匯出 CSV（記錄）'}
        </Button>

        <Button variant="ghost" block disabled={busy !== null} onClick={pickImportFile}>
          <Upload size={18} aria-hidden />
          {busy === 'import' ? '還原中…' : '從備份還原'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void onImportFile(file);
          }}
        />
        <p className="text-xs text-gray-400">
          還原會依 id 合併寫入，不會刪除目前已有、但備份檔裡沒有的資料。
        </p>
      </Card>
    </main>
  );
}
