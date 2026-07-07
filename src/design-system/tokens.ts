/**
 * 設計 token（單一事實來源）：組件用 token，不硬寫值。
 * 亮色主題（P0 只做 light）。
 */
export const tokens = {
  color: {
    primary: '#6366f1',
    primarySoft: '#eef2ff',
    text: '#1f2937',
    textMuted: '#6b7280',
    bg: '#ffffff',
    bgSubtle: '#f9fafb',
    border: '#e5e7eb',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 8, md: 12, lg: 16, full: 9999 },
  shadow: {
    card: '0 1px 3px rgb(0 0 0 / 0.08)',
    modal: '0 10px 30px rgb(0 0 0 / 0.15)',
  },
  typography: {
    fontFamily: "system-ui, -apple-system, 'Noto Sans TC', sans-serif",
    size: { xs: 12, sm: 14, base: 16, lg: 18, xl: 22, xxl: 28 },
  },
  /** E14：最小觸控目標 44px。 */
  touchTargetPx: 44,
} as const;
