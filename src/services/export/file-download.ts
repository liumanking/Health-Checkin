import { logger } from '@/core/logger/logger';

function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 設計書 P8：Web Share API 優先（行動裝置分享），不支援則直接下載。 */
export async function shareOrDownloadFile(filename: string, content: string, mime: string): Promise<void> {
  if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
    try {
      const file = new File([content], filename, { type: mime });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return;
      }
    } catch (e) {
      // 使用者取消分享，或裝置不支援檔案分享 → 退回直接下載
      logger.debug('share failed, falling back to download', { error: String(e) });
    }
  }
  downloadTextFile(filename, content, mime);
}
