/**
 * 鐵律 4：未到該 Phase 的功能，flag = false。
 * P0 只有骨架，所有功能模組先關閉。
 */
export const featureFlags = {
  today: false, // P1
  habitEditor: false, // P1
  timer: false, // P2
  stats: false, // P3
  history: false, // P4
  organize: false, // P4
  reminders: false, // P5
  quickEntry: false, // P6
  onboarding: false, // P7
  backup: false, // P8
  achievements: false, // 預留
  ai: false, // 預留
  sync: false, // Phase 2
  members: false, // Phase 2
} satisfies Record<string, boolean>;

export type FeatureFlag = keyof typeof featureFlags;

export function isEnabled(flag: FeatureFlag): boolean {
  return featureFlags[flag];
}
