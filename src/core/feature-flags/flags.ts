/**
 * 鐵律 4：未到該 Phase 的功能，flag = false。
 * P0 只有骨架，所有功能模組先關閉。
 */
export const featureFlags = {
  today: true, // P1 ✅
  habitEditor: true, // P1 ✅
  timer: true, // P2 ✅
  stats: true, // P3 ✅
  history: true, // P4 ✅
  organize: true, // P4 ✅
  reminders: true, // P5 ✅
  quickEntry: true, // P6 ✅
  onboarding: true, // P7 ✅
  backup: true, // P8 ✅
  achievements: false, // 預留
  ai: false, // 預留
  sync: false, // Phase 2
  members: false, // Phase 2
} satisfies Record<string, boolean>;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
