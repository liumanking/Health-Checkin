# 個人習慣追蹤器 — PWA 架構設計書（Claude Code Brief）

> 版本 **v4.0-PWA**
> 平台：PWA（Mobile-first Android Chrome，可 Add to Home Screen）
> 技術棧：React 19 + TypeScript + Vite + TailwindCSS + Dexie.js(IndexedDB) + Workbox
> **核心紀律不變：便宜的「結構」現在放，昂貴的「行為」延後做。**

---

## 0. 補缺清單

| # | 缺口 | 類型 | 處理方式 |
|---|---|---|---|
| E1 | 缺 PWA 安裝引導 | PWA 必備 | `beforeinstallprompt` 攔截 + 自訂安裝 Banner |
| E2 | 缺 Service Worker 離線策略 | PWA 必備 | Workbox：App Shell cache-first、API stale-while-revalidate |
| E3 | 缺 Web Worker 計時 | PWA 必備 | Dedicated Worker 跑計時邏輯，主線程只收訊息 |
| E4 | 缺 IndexedDB migration 策略 | 資料層 | Dexie version upgrade hooks，對應 schemaVersion |
| E5 | 缺 Responsive 斷點定義 | UI | Mobile-first：sm(640) / md(768) / lg(1024)，P1 只做 mobile |
| E6 | 缺 Web Push 後端 | Phase2 | 現在預留介面；Phase2 用 Cloudflare Workers + web-push |
| E7 | 缺 haptic / 震動回饋 | 體驗 | `navigator.vibrate()` 打卡成功時短震動 |
| E8 | 缺 Error Boundary | 穩定性 | React Error Boundary + 全域 unhandledrejection |
| E9 | 缺 Loading / Skeleton 策略 | 體驗 | 每頁有 Skeleton 佔位，Dexie 讀取 < 50ms 可省略 |
| E10 | 缺 Data Validation 層 | 品質 | Zod schema 驗 Command input，domain 層不信任外部 |
| E11 | 缺 匯出格式向下相容 | 資料層 | schemaVersion + migration map：舊版匯入時自動升級 |
| E12 | 缺 日期時區處理 | 品質 | date-fns + date-fns-tz；Log.date 存 YYYY-MM-DD（local date） |
| E13 | 缺 Undo/Redo 機制 | 體驗 | 現在預留 CommandHistory 介面；P1 只做刪除後 Toast Undo |
| E14 | 缺 Accessibility | 品質 | ARIA roles、focus management、最小觸控 44px |

---

## 1. 需求總結

**核心功能**：打卡/計量/計時三類。排程 daily/anytime。目標 日/週/月。完成判定。**重點累計**。計時即時＋手動、背景續計、可並行、停止寫入、到時提醒。提醒多時段。補登。統計熱力圖＋趨勢＋累計＋**多時段圖表**（日/週/月/自訂範圍切換）。備份 JSON/CSV。整理分類/標籤/拖曳/封存。快速記錄。清單主畫面。首次範本。亮色主題。多人各自分開（memberId）。**打卡成功慶祝煙火**（Canvas confetti + 震動回饋）。

**PWA 特性**：
- PWA Shortcuts（manifest `shortcuts[]`）+ Badge API（未讀數）
- 背景計時 → Web Worker（不受 tab throttle）+ Page Visibility API（回前台同步）
- Web Notification API（前台）+ Push API（後台，Phase2）
- Add to Home Screen prompt + 安裝引導頁
- Service Worker cache App Shell；IndexedDB 資料全在本地，完全離線可用

---

## 2. 架構總原則

1. **Clean Architecture + Feature-First**：每功能模組 `ui / application / domain / data` 四層。
2. **CQRS Lite**：所有動作走 `application` 層的 Command（寫）/ Query（讀）；UI、通知、LINE Bot、AI 都呼叫同一批。
3. **依賴單向**：功能模組不互相 import；透過 core event bus 通訊。
4. **資料來源分離**：`Repository → LocalDataSource(Dexie/IndexedDB) + RemoteDataSource(預留)`。
5. **Query 物件**：Repository 對外 `search(Query)` / `getById`，不長 `getByXxx()`。
6. **事件三層**：Domain / Application / Integration，通知式不搬資料。
7. **同步友善**：所有實體 `createdAt/updatedAt/deletedAt/syncVersion`；軟刪除。
8. **PWA 原則**：離線優先、Service Worker 管快取、Web Worker 管計時、漸進增強。
9. **Validation at boundary**：Zod schema 在 Command 入口驗證，domain 層純邏輯。
10. **Feature Flag** 控制未完成模組；**AppConfig** 區分 dev/prod。

---

## 3. 技術選型

| 類別 | 選擇 | 原因 |
|---|---|---|
| 框架 | **React 19 + TypeScript** | 生態最大、Claude Code 最熟悉 |
| 建構 | **Vite 6** | 快速 HMR、PWA 插件成熟 |
| 樣式 | **TailwindCSS 4** | Utility-first、mobile-first 斷點 |
| 狀態 | **Zustand + persist** | 輕量、TypeScript 推斷好、persist 到 IndexedDB |
| 資料庫 | **Dexie.js 4 (IndexedDB)** | 宣告式 schema + index + transaction + 版本遷移 |
| 路由 | **React Router v7** | 成熟穩定 |
| 圖表 | **Recharts** | React 生態、SVG、響應式 |
| 日期 | **date-fns + date-fns-tz** | Tree-shakeable、不可變 |
| 驗證 | **Zod** | Schema-first、TypeScript 推斷 |
| PWA | **Vite PWA Plugin (Workbox)** | 自動生成 SW、precache manifest |
| 計時 | **Web Worker** | 背景精準計時 |
| 通知 | **Notification API** | 瀏覽器原生 |
| ID | **nanoid** | 短、快、URL-safe |
| 拖曳 | **@dnd-kit/core** | React 拖曳首選 |
| 圖標 | **Lucide React** | 輕量 SVG icon 集 |
| 慶祝動畫 | **canvas-confetti** | 輕量、無依賴、Canvas 煙火效果 |
| 測試 | **Vitest + Testing Library** | Vite 原生 |

---

## 4. Application 層：CQRS Lite

```
src/application/
  commands/     寫意圖 + Handler
    RecordHabitCommand.ts    # 打卡/計量記錄
    AddHabitCommand.ts       # 新增習慣
    UpdateHabitCommand.ts    # 編輯習慣
    ArchiveHabitCommand.ts   # 封存
    SoftDeleteCommand.ts     # 軟刪除（通用）
    BackfillLogCommand.ts    # 補登
    StartTimerCommand.ts     # 開始計時
    PauseTimerCommand.ts     # 暫停
    StopTimerCommand.ts      # 停止（寫入 Log）
    ImportDataCommand.ts     # 匯入
    AddFromTemplateCommand.ts # 從範本新增
    ReorderCommand.ts        # 拖曳排序

  queries/      讀意圖 + Handler
    GetTodayListQuery.ts     # 今日清單
    GetHeatmapQuery.ts       # 熱力圖資料
    GetCumulativeQuery.ts    # 累計統計
    GetTrendQuery.ts         # 趨勢折線
    GetHabitDetailQuery.ts   # 單一習慣詳情
    SearchHabitsQuery.ts     # 搜尋/篩選
    SearchLogsQuery.ts       # Log 搜尋（含日期範圍）
    GetPeriodStatsQuery.ts   # 依時段（日/週/月/自訂）聚合統計
    GetExportDataQuery.ts    # 匯出用完整資料

  pipeline/     共用管線
    commandPipeline.ts       # validate(Zod) → handle → emit DomainEvent → writeAuditLog
    queryPipeline.ts         # handle → return（無副作用）
```

**寫流**：`UI → Zustand action → Command.validate(Zod) → Command.handle() → Repository → Dexie` → 發 DomainEvent → 寫 AuditLog → Zustand 更新 UI。
**讀流**：`UI / AIContextBuilder → Query.handle() → Repository.search(QueryObject)` → return data。

---

## 5. 模組分解

### 共享層（src/core/）
- **event-bus/**：三層事件（DomainEvent / AppEvent / IntegrationEvent）+ typed emitter
- **cqrs/**：Command / Query / Handler base types
- **feature-flags/**：簡單 `Record<string, boolean>` 開關
- **logger/**：`console` wrapper + structured log
- **errors/**：AppError 型別階層
- **result/**：`Result<T, E>` 型別（不用 throw）
- **utils/**：日期格式、常數

### 設定（src/config/）
- **app-config.ts**：dev / prod 環境變數
- **db-config.ts**：Dexie schema 版本

### 設計系統（src/design-system/）
- **tokens/**：color / spacing / typography / shadow / radius
- **components/**：Button / Card / Input / Modal / Toast / Skeleton / BottomSheet / Confetti

### Domain（src/domain/）
- **entities/**：所有型別定義（TypeScript interface + Zod schema）
- **queries/**：HabitQuery / LogQuery（Specification 物件）
- **repositories/**：Repository 介面（search / getById / upsert / softDelete）
- **logic/**：純函式（isCompleted / calcCumulative / checkGoal / evaluateAchievement）

### Data（src/data/）
- **db/**：Dexie database class + table 定義 + version migrations
- **sources/local/**：LocalDataSource 實作（Dexie CRUD）
- **sources/remote/**：RemoteDataSource 介面（Phase2）
- **repositories/**：Repository 實作（組合 local + remote）
- **export/**：JSON/CSV 匯出（含 schemaVersion envelope）

### Services（src/services/）
- **notification/**：Notification API wrapper + 排程邏輯
- **timer-worker/**：Web Worker 計時引擎
- **export/**：檔案下載觸發
- **analytics/**：摘要計算（從 Log 即時算，後物化）
- **audit/**：AuditLog 寫入
- **pwa/**：安裝提示 + SW 註冊 + 更新通知

### Features（src/features/）
每個 feature 內部結構：
```
feature-name/
  ui/           # React components（頁面 + 區塊）
  application/  # feature-specific 的 Zustand slice 或 hooks
  domain/       # feature-specific 型別（若有）
  data/         # feature-specific 資料轉換（若有）
```

功能列表：
```
today/            # 主畫面：今日習慣清單 + 打卡/計量/開始計時 + 打卡成功觸發 Confetti
habit-editor/     # 新增/編輯習慣表單
timer/            # 計時介面 + Web Worker 通訊
stats/            # 熱力圖 + 趨勢折線 + 累計卡片 + 多時段切換（日/週/月/自訂範圍）
history/          # 歷史日曆 + 補登
organize/         # 分類/標籤/拖曳排序/封存
reminders/        # 提醒設定
onboarding/       # 首次使用 + 範本選擇
backup/           # 匯出匯入
settings/         # 設定頁
achievements/     # 成就（預留模型）
ai/               # AI 層（預留結構）
  context/        #   AIContextBuilder
  prompts/        #   提示樣板
  agents/         #   代理定義
  tools/          #   工具（包裝 Command/Query）

# Phase 2
sync-cloud/       # Cloudflare Workers 同步
members/          # 多成員
```

---

## 6. 專案結構

```
habit-tracker-pwa/
├── public/
│   ├── manifest.json          # PWA manifest（含 shortcuts）
│   ├── icons/                 # 192 + 512 icon
│   └── sw-custom.js           # Workbox 之外的自訂 SW 邏輯（預留）
├── src/
│   ├── core/
│   │   ├── event-bus/
│   │   │   ├── types.ts       # DomainEvent | AppEvent | IntegrationEvent
│   │   │   └── bus.ts         # typed EventEmitter
│   │   ├── cqrs/
│   │   │   ├── command.ts     # Command<TInput, TOutput> base
│   │   │   ├── query.ts       # Query<TInput, TOutput> base
│   │   │   └── pipeline.ts    # validate → handle → emit → audit
│   │   ├── feature-flags/
│   │   │   └── flags.ts       # { achievements: false, ai: false, sync: false }
│   │   ├── logger/
│   │   ├── errors/
│   │   ├── result/
│   │   └── utils/
│   │       ├── date.ts        # date-fns helpers
│   │       └── id.ts          # nanoid wrapper
│   ├── config/
│   │   └── app-config.ts
│   ├── design-system/
│   │   ├── tokens.ts
│   │   └── components/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       ├── BottomSheet.tsx
│   │       ├── Skeleton.tsx
│   │       └── ...
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── base.ts        # SyncBase interface + Zod schema
│   │   │   ├── member.ts
│   │   │   ├── habit.ts
│   │   │   ├── log.ts
│   │   │   ├── timer-session.ts
│   │   │   ├── timer-profile.ts
│   │   │   ├── reminder.ts
│   │   │   ├── category.ts
│   │   │   ├── tag.ts
│   │   │   ├── template.ts
│   │   │   ├── achievement.ts
│   │   │   ├── summary.ts
│   │   │   └── audit-log.ts
│   │   ├── queries/
│   │   │   ├── habit-query.ts   # HabitQuery specification
│   │   │   └── log-query.ts     # LogQuery specification
│   │   ├── repositories/
│   │   │   ├── habit-repo.ts    # interface
│   │   │   ├── log-repo.ts
│   │   │   ├── timer-repo.ts
│   │   │   └── ...
│   │   └── logic/
│   │       ├── completion.ts    # isCompleted / calcDailyProgress
│   │       ├── cumulative.ts    # calcCumulative / calcStreak
│   │       ├── goal.ts          # checkGoal / goalProgress
│   │       └── achievement.ts   # evaluateRules
│   ├── data/
│   │   ├── db/
│   │   │   ├── database.ts     # Dexie subclass + table 定義
│   │   │   └── migrations.ts   # version upgrade hooks
│   │   ├── sources/
│   │   │   ├── local/          # Dexie CRUD 實作
│   │   │   └── remote/         # 預留介面
│   │   ├── repositories/       # 組合 local+remote 實作
│   │   └── export/
│   │       ├── json-export.ts
│   │       ├── csv-export.ts
│   │       └── import.ts       # 含 schema migration
│   ├── application/
│   │   ├── commands/
│   │   ├── queries/
│   │   └── pipeline/
│   ├── services/
│   │   ├── notification/
│   │   ├── timer-worker/
│   │   │   ├── timer.worker.ts  # Web Worker 本體
│   │   │   └── timer-bridge.ts  # 主線程 ↔ Worker 通訊
│   │   ├── export/
│   │   ├── analytics/
│   │   ├── audit/
│   │   └── pwa/
│   │       ├── install-prompt.ts
│   │       ├── sw-registration.ts
│   │       └── update-notify.ts
│   ├── features/
│   │   ├── today/
│   │   │   ├── ui/
│   │   │   │   ├── TodayPage.tsx
│   │   │   │   ├── HabitCard.tsx
│   │   │   │   └── QuickActions.tsx
│   │   │   └── application/
│   │   │       └── useTodayStore.ts   # Zustand slice
│   │   ├── habit-editor/
│   │   ├── timer/
│   │   ├── stats/
│   │   ├── history/
│   │   ├── organize/
│   │   ├── reminders/
│   │   ├── onboarding/
│   │   ├── backup/
│   │   ├── settings/
│   │   ├── achievements/       # 預留
│   │   └── ai/                 # 預留
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx          # React Router 設定
│   │   ├── providers.tsx       # 全域 Provider 組合
│   │   └── ErrorBoundary.tsx
│   ├── workers/
│   │   └── timer.worker.ts     # Vite worker entry
│   └── main.tsx
├── index.html
├── vite.config.ts              # 含 VitePWA plugin
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── CLAUDE.md                   # Claude Code 鐵律
```

---

## 7. 資料模型（TypeScript + Zod）

```typescript
// === 同步基底 ===
interface SyncBase {
  createdAt: string;    // ISO 8601
  updatedAt: string;
  deletedAt?: string;   // 軟刪除
  syncVersion: number;  // Phase2 同步用
}

// === 核心實體 ===
interface Member extends SyncBase {
  id: string;
  name: string;
}

interface Category extends SyncBase {
  id: string; memberId: string; name: string; color: string; order: number;
}

interface Tag extends SyncBase {
  id: string; memberId: string; name: string;
}

type HabitType = 'check' | 'count' | 'timer';
type Schedule = 'daily' | 'anytime';

interface Habit extends SyncBase {
  id: string; memberId: string;
  name: string; emoji: string; color: string; order: number; archived: boolean;
  type: HabitType; unit?: string; decimal: boolean; step: number;
  schedule: Schedule;
  goalDaily?: number; goalWeekly?: number; goalMonthly?: number;
  categoryId?: string;
}

interface HabitTag {
  habitId: string; tagId: string;
}

type ReminderRule = 'daily' | 'weekdays' | 'weekends' | 'monthly' | 'custom';

interface HabitReminder extends SyncBase {
  id: string; habitId: string;
  time: string;       // "HH:mm"
  enabled: boolean;
  rule: ReminderRule;  // 預設 'daily'，UI 暫只做 daily
}

type LogSource = 'app' | 'shortcut' | 'notification' | 'line';

interface Log extends SyncBase {
  id: string; habitId: string; memberId: string;
  date: string;        // "YYYY-MM-DD" local date
  amount: number;
  source: LogSource;
  at: string;          // ISO 8601 精確時間
  note?: string;
}

type TimerStatus = 'running' | 'paused' | 'completed' | 'cancelled';

interface TimerProfile extends SyncBase {
  id: string; name: string;
  habitId?: string;    // 綁定特定習慣 or global
  durationMin: number;
}

interface TimerSession extends SyncBase {
  id: string; habitId: string; memberId: string;
  profileId?: string;
  startedAt: string; endedAt?: string;
  accumulatedMs: number;
  status: TimerStatus;
}

interface HabitTemplate {
  id: string; name: string; emoji: string; color: string;
  type: HabitType; unit?: string; decimal: boolean; step: number;
  goalDaily?: number; category?: string; tags: string[];
}

// === 成就（預留）===
interface Achievement {
  id: string; code: string; name: string; emoji: string;
  metric: 'count' | 'minutes' | 'distance'; threshold: number;
}
interface AchievementRule {
  id: string; achievementId: string;
  scope: 'global' | 'habit' | 'category';
  window: 'total' | 'year';
}
interface UserAchievement extends SyncBase {
  id: string; memberId: string; achievementId: string; unlockedAt: string;
}

// === 摘要（介面先行）===
interface DailySummary {
  memberId: string; habitId: string; periodKey: string; // "YYYY-MM-DD"
  total: number; completed: boolean;
}
// Weekly/MonthlySummary 同理

// === 稽核 ===
interface AuditLog {
  id: string; memberId: string;
  action: string;      // 'create' | 'update' | 'delete' | 'archive' | ...
  entity: string;      // 'habit' | 'log' | 'timer_session' | ...
  entityId: string;
  payload: string;     // JSON string of changes
  at: string;
}

// === 匯出封套 ===
interface ExportEnvelope {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  data: {
    members: Member[];
    habits: Habit[];
    logs: Log[];
    categories: Category[];
    tags: Tag[];
    habitTags: HabitTag[];
    reminders: HabitReminder[];
    timerSessions: TimerSession[];
    timerProfiles: TimerProfile[];
    templates: HabitTemplate[];
  };
}
```

---

## 8. Dexie.js 資料庫設計

```typescript
// src/data/db/database.ts
import Dexie, { type Table } from 'dexie';

class HabitTrackerDB extends Dexie {
  members!: Table<Member>;
  habits!: Table<Habit>;
  logs!: Table<Log>;
  categories!: Table<Category>;
  tags!: Table<Tag>;
  habitTags!: Table<HabitTag>;
  reminders!: Table<HabitReminder>;
  timerSessions!: Table<TimerSession>;
  timerProfiles!: Table<TimerProfile>;
  templates!: Table<HabitTemplate>;
  achievements!: Table<Achievement>;
  achievementRules!: Table<AchievementRule>;
  userAchievements!: Table<UserAchievement>;
  auditLogs!: Table<AuditLog>;

  constructor() {
    super('habit-tracker');

    this.version(1).stores({
      members:          'id, name',
      habits:           'id, memberId, categoryId, [memberId+archived], order',
      logs:             'id, habitId, memberId, date, [habitId+date], [memberId+date]',
      categories:       'id, memberId, order',
      tags:             'id, memberId',
      habitTags:        '[habitId+tagId], habitId, tagId',
      reminders:        'id, habitId',
      timerSessions:    'id, habitId, memberId, status, [memberId+status]',
      timerProfiles:    'id, habitId',
      templates:        'id',
      achievements:     'id, code',
      achievementRules: 'id, achievementId',
      userAchievements: 'id, memberId, achievementId',
      auditLogs:        'id, memberId, entity, at',
    });
  }
}

export const db = new HabitTrackerDB();
```

**查詢一律過濾** `deletedAt === undefined`。刪除 = 設 `deletedAt`。

---

## 9. Web Worker 計時設計

```
主線程                          Web Worker (timer.worker.ts)
─────────                      ──────────────────────────────
postMessage({                   onmessage → 啟動 setInterval(100ms)
  type: 'START',                   每 100ms 累計 elapsed
  sessionId, startMs              每 1000ms postMessage({ type:'TICK', elapsed })
})
                                postMessage({ type:'COMPLETE', elapsed })
                                  ← 到達 profileDuration 時

onmessage(TICK) →
  更新 UI 顯示

onmessage(COMPLETE) →
  呼叫 StopTimerCommand
  觸發 Notification

postMessage({ type:'PAUSE' })   → clearInterval，記住 elapsed
postMessage({ type:'RESUME' })  → 恢復 setInterval
postMessage({ type:'STOP' })    → clearInterval，回報 final elapsed
```

**Page Visibility**：頁面回前台時，Worker 發一次 `SYNC` 訊息校正。Worker 不受 tab throttle。

---

## 10. PWA 設定

### manifest.json（關鍵欄位）
```json
{
  "name": "習慣追蹤器",
  "short_name": "習慣",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "shortcuts": [
    {
      "name": "快速記錄",
      "url": "/quick-entry",
      "icons": [{ "src": "/icons/shortcut-quick.png", "sizes": "96x96" }]
    }
  ]
}
```

### Service Worker 策略（Workbox via VitePWA）
- **App Shell**（HTML/CSS/JS/fonts）：CacheFirst
- **API 請求**（Phase2）：StaleWhileRevalidate
- **圖片/icon**：CacheFirst, 30 天過期
- **離線 fallback**：全功能可離線（IndexedDB 本地資料）

---

## 11. 事件三層

| 層 | 事件 | 用途 |
|---|---|---|
| Domain | HabitRecorded, HabitGoalReached, TimerCompleted, AchievementUnlocked | 領域內副作用 |
| Application | TodayListChanged, StatsInvalidated, TimerUIUpdate | 跨功能 UI/服務 |
| Integration | LineMessageSent, CloudSyncCompleted, AiContextRequested | 外部（Phase2） |

---

## 12. 路由設計

```typescript
const routes = [
  { path: '/',              element: <TodayPage /> },
  { path: '/habit/new',     element: <HabitEditorPage /> },
  { path: '/habit/:id',     element: <HabitDetailPage /> },
  { path: '/habit/:id/edit',element: <HabitEditorPage /> },
  { path: '/timer/:id',     element: <TimerPage /> },
  { path: '/stats',         element: <StatsPage /> },
  { path: '/history',       element: <HistoryPage /> },
  { path: '/organize',      element: <OrganizePage /> },
  { path: '/backup',        element: <BackupPage /> },
  { path: '/settings',      element: <SettingsPage /> },
  { path: '/quick-entry',   element: <QuickEntryPage /> },  // PWA shortcut 目標
  { path: '/onboarding',    element: <OnboardingPage /> },
];
```

底部導航：Today / Stats / Organize / Settings（4 tabs）。

---

## 13.「現在做｜現在預留」紀律

| 區塊 | 現在做 | 預留 / Phase2 |
|---|---|---|
| CQRS commands/queries | ✅ 全功能走 | 進階 pipeline |
| Query 物件 | ✅ HabitQuery/LogQuery | 更多 spec 條件 |
| 事件三層 | ✅ 分類 + 主要事件 | Integration 實作 |
| Sync 欄位 + 軟刪除 | ✅ 欄位 + 過濾 | 同步演算法 |
| DataSource 分離 | ✅ Local 實作 + Remote 介面 | Remote 實作 |
| Feature Flags | ✅ 簡版 | 遠端旗標 |
| AppConfig | ✅ dev/prod | staging + 雲端端點 |
| AI Context | ✅ 結構骨架 | Builder 邏輯 |
| TimerProfile | ✅ 模型 + 欄位 | 快速開始 UI |
| ReminderRule | ✅ 欄位（預設 daily） | weekday/monthly UI |
| AuditLog | ✅ 表 + Command 寫入 | 檢視 UI |
| Achievement | ✅ 模型 + 規則 | 評估器 + UI |
| PWA install prompt | ✅ 基本 banner | 進階引導頁 |
| Web Worker 計時 | ✅ 完整實作 | — |
| Service Worker | ✅ App Shell cache | Push + background sync |
| Zod validation | ✅ Command 入口 | 全域 schema registry |
| Error Boundary | ✅ 全域 | 細粒度 per-feature |
| Undo | 預留 CommandHistory 介面 | 完整 undo stack |
| Accessibility | ✅ ARIA + focus + 44px | 完整 a11y audit |

---

## 14. 路線圖

```
P0 骨架
  ├── Vite + React + TS + Tailwind 初始化
  ├── PWA manifest + VitePWA 設定 + icon
  ├── Dexie schema v1（含 sync 欄位 + softDelete + 所有表）
  ├── core/（event-bus 三層 / cqrs base / feature-flags / logger / errors / result）
  ├── config/（AppConfig dev/prod）
  ├── design-system/（tokens + Button/Card/Modal/Toast/Skeleton）
  ├── domain/（entities Zod schemas + Repository 介面 + Query 物件 + 純邏輯）
  ├── data/（LocalDataSource Dexie 實作 + Repository 實作）
  ├── services/（audit 骨架）
  ├── app/（Router + ErrorBoundary + providers）
  ├── 空 feature_ai 結構
  └── CLAUDE.md

P1 每天可用
  ├── today/（清單 + 打卡/計量，經 RecordHabitCommand）
  ├── 打卡成功 → Confetti 煙火 + navigator.vibrate() 震動
  ├── habit-editor/（新增/編輯表單）
  ├── 底部導航 4 tabs
  └── PWA 安裝引導 banner

P2 計時
  ├── Web Worker 計時引擎
  ├── timer/（計時 UI + 並行支援 + Page Visibility 同步）
  ├── TimerProfile 模型備用
  └── 到時 Notification

P3 目標 / 統計
  ├── 日/週/月目標判定
  ├── stats/（SVG 熱力圖 + Recharts 趨勢折線 + 累計卡片）
  ├── 多時段圖表切換（日/週/月/自訂範圍）+ GetPeriodStatsQuery
  ├── Achievement 規則評估（UI 後補）
  └── GetHeatmapQuery / GetCumulativeQuery / GetTrendQuery

P4 補登 / 整理
  ├── history/（日曆選日 + 補登，走 BackfillLogCommand）
  ├── organize/（分類/標籤/dnd-kit 拖曳/封存）
  └── 軟刪除 + Undo Toast

P5 提醒
  ├── reminders/（多時段設定，rule 預設 daily）
  ├── Notification API 前台提醒
  └── 通知快速動作

P6 快速記錄
  ├── quick-entry/ 頁面（PWA shortcut 目標）
  └── Badge API 未完成數

P7 範本
  └── onboarding/（HabitTemplate 選擇 + 首次引導）

P8 匯出
  ├── JSON/CSV 匯出（含 schemaVersion envelope）
  ├── 匯入 + schema migration
  └── Web Share API / 下載

效能優化（按需）
  └── 物化 DailySummary / WeeklySummary

Phase 2（雲端 / AI）
  ├── RemoteDataSource 實作（Cloudflare Workers + D1）
  ├── Push API 後台通知
  ├── sync-cloud/（last-write-wins + tombstone）
  ├── members/（多成員）
  └── ai/（AIContextBuilder + Agent）
```

---

## 15. CLAUDE.md（Claude Code 鐵律）

以下內容即為 `CLAUDE.md` 的完整內容，放在專案根目錄：

```markdown
# CLAUDE.md — 習慣追蹤器 PWA

## 身份
你是這個 PWA 專案的共同建設者。Miles 做所有決策和判斷，你負責設計、編碼、執行。

## 鐵律（違反任何一條必須停下來問）

1. **不猜測需求**：不確定就問，不要自己發明功能
2. **不跳階段**：嚴格按 P0→P1→P2…順序，不偷跑後面的 Phase
3. **不碰決策**：架構取捨、功能優先順序、UX 選擇一律回報讓 Miles 決定
4. **Feature Flag 保護未完成模組**：未到該 Phase 的功能，flag = false
5. **軟刪除**：所有刪除操作設 deletedAt，查詢一律過濾 deletedAt === undefined
6. **CQRS 紀律**：所有寫操作走 Command + pipeline，所有讀操作走 Query
7. **Zod 驗證**：Command 入口必須 Zod parse，domain 層不信任外部輸入
8. **事件通知不搬資料**：事件只說「發生了什麼」，資料流走 Zustand store
9. **TypeScript strict**：tsconfig strict: true，不用 any
10. **依賴單向**：feature 不互相 import，透過 event bus 通訊
11. **Query 物件**：Repository 只有 search(Query) / getById / upsert / softDelete
12. **離線優先**：所有功能必須離線可用，不依賴網路
13. **Mobile-first**：UI 以 mobile 視口為主，最小觸控 44px
14. **每步可驗證**：每完成一個功能就能在瀏覽器看到結果

## 技術約束

- React 19 + TypeScript + Vite 6 + TailwindCSS 4
- Dexie.js 4 (IndexedDB) — 不用 localStorage
- Zustand（狀態管理）— 不用 Redux / Context 大量嵌套
- React Router v7
- Recharts（圖表）
- date-fns（日期）
- Zod（驗證）
- nanoid（ID 生成）
- Web Worker（計時）
- VitePWA plugin（Service Worker）
- Lucide React（圖標）
- canvas-confetti（打卡慶祝煙火）

## 專案結構規則

- 共享型別放 src/domain/entities/
- Repository 介面放 src/domain/repositories/
- Repository 實作放 src/data/repositories/
- Command/Query 放 src/application/
- 每個 feature 內 ui/ + application/ 子目錄
- 設計 token 放 src/design-system/tokens.ts，組件用 token 不硬寫值

## 工作流程

1. 開工前先說你要做什麼（一句話）
2. 做完一個可驗證的單元就報告
3. 遇到需要決策的岔路就停下來列選項
4. 每個 Command 都要寫 AuditLog
5. 每個新 Dexie table 都要有 migration hook 預留

## 當前階段：P0（骨架）
```
