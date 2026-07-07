/**
 * 事件三層：Domain / Application / Integration。
 * 鐵律 8：事件通知不搬資料 —— payload 只帶 id 與最小識別資訊，資料流走 store/Query。
 */
export type EventLayer = 'domain' | 'app' | 'integration';

interface BaseEvent<TType extends string, TPayload> {
  readonly type: TType;
  readonly layer: EventLayer;
  readonly at: string; // ISO 8601
  readonly payload: TPayload;
}

// === Domain events ===
export type HabitRecordedEvent = BaseEvent<
  'HabitRecorded',
  { habitId: string; logId: string; memberId: string; date: string }
>;
export type HabitGoalReachedEvent = BaseEvent<
  'HabitGoalReached',
  { habitId: string; memberId: string; period: 'daily' | 'weekly' | 'monthly' }
>;
export type TimerCompletedEvent = BaseEvent<
  'TimerCompleted',
  { sessionId: string; habitId: string; memberId: string }
>;
export type AchievementUnlockedEvent = BaseEvent<
  'AchievementUnlocked',
  { achievementId: string; memberId: string }
>;

export type DomainEvent =
  | HabitRecordedEvent
  | HabitGoalReachedEvent
  | TimerCompletedEvent
  | AchievementUnlockedEvent;

// === Application events ===
export type TodayListChangedEvent = BaseEvent<'TodayListChanged', { memberId: string }>;
export type StatsInvalidatedEvent = BaseEvent<'StatsInvalidated', { memberId: string }>;
export type TimerUIUpdateEvent = BaseEvent<'TimerUIUpdate', { sessionId: string }>;

export type AppEvent = TodayListChangedEvent | StatsInvalidatedEvent | TimerUIUpdateEvent;

// === Integration events（Phase 2 實作，先定型別）===
export type LineMessageSentEvent = BaseEvent<'LineMessageSent', { messageId: string }>;
export type CloudSyncCompletedEvent = BaseEvent<'CloudSyncCompleted', { syncedAt: string }>;
export type AiContextRequestedEvent = BaseEvent<'AiContextRequested', { requestId: string }>;

export type IntegrationEvent =
  | LineMessageSentEvent
  | CloudSyncCompletedEvent
  | AiContextRequestedEvent;

export type AnyEvent = DomainEvent | AppEvent | IntegrationEvent;
export type EventType = AnyEvent['type'];
