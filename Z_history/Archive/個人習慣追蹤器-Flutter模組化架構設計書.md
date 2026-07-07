# 個人習慣追蹤器 — Flutter 模組化架構設計書

> 版本 **v3.0**（整合第二輪審查：A/B/C/D 級＋CQRS Lite，共 11 項）
> 架構：Flutter（Android .apk）→ Cloudflare → LINE Bot → AI Coach → Agent 的演進路線
> **核心紀律：便宜的「結構」現在放（欄位/介面/資料夾/Query 物件），昂貴的「行為」延後做。讓 P1 仍能快速出貨、又不必回頭重構。**

---

## 0. v3 變更摘要（第二輪審查如何整合）

| 級 | # | 缺口 | 整合方式 | 時機 |
|---|---|---|---|---|
| A | 1 | Repository 方法爆炸 | **Query 物件（Specification）**：`HabitQuery/LogQuery` + `repo.search(query)` | **現在做** |
| A | 2 | Event 未分層 | **Domain / Application / Integration Event** 三類 | **現在做（分類）** |
| A | 3 | Timer 缺 Profile | 預留 `TimerProfile`（番茄鐘25/冥想15…快速開始） | 現在預留 |
| A | 4 | Reminder 缺規則 | `HabitReminder.rule` 欄位（預設 daily，可擴充） | 現在預留（**只欄位**） |
| B | 5 | 缺 Audit Log | `AuditLog` 表（由 Command pipeline 寫入） | 現在預留 |
| B | 6 | 缺 Feature Flag | `core/feature_flags`（enableAchievement/AI/Widget） | **現在做（簡版）** |
| B | 7 | 缺 Env Config | `config/AppConfig`（dev/staging/prod，Phase2 用） | **現在做（最小）** |
| C | 8 | AI 缺 Context 層 | `feature_ai/{context,prompts,agents,tools}` + `AIContextBuilder` | 現在預留（結構） |
| D | 9 | 缺 Sync Metadata | 所有可同步實體加 `updatedAt/deletedAt/syncVersion` | **現在做（欄位）** |
| D | 10 | 缺 Soft Delete | 一律 `deletedAt` 軟刪除，查詢過濾 | **現在做** |
| ★ | 11 | UseCase → CQRS Lite | `application/{commands,queries,handlers}` | **現在做** |

---

## 1. 需求總結（不變）

類型：打卡/計量/計時。排程：每天、隨時記。目標：日/週/月可選填。完成＝有目標達標、無目標有記。**重點是累計（不重 streak）**。計時：即時＋手動、背景續計、可並行、停止寫入、到時提醒。提醒：每習慣多時段。補登：可改過去任一天。統計：熱力圖＋趨勢折線＋週/月/年累計。備份：JSON/CSV。整理：分類/標籤/拖曳/封存。快速記錄：Widget＋通知按鈕＋App +1。主畫面：清單。首次：習慣範本。主題：亮色。多人：各自分開（`memberId`）。平台：Android。

---

## 2. 架構總原則（v3）

1. **Clean Architecture + Feature-First**：每功能四層 `presentation / application / domain / data`。
2. **CQRS Lite ＝ 單一選擇點**：所有動作走 `application` 的 **Command（寫）/ Query（讀）**；UI、通知動作、LINE Bot、AI、Agent 都呼叫同一批，不碰 Repository/DB。
3. **依賴單向**；功能模組不互相 import。
4. **資料來源分離**：`Repository → LocalDataSource(Drift) + RemoteDataSource(預留)`。
5. **Query 物件**：Repository 對外只有 `search(Query)` / `getById`，不長一堆 `getByXxx()`。
6. **事件三層**：Domain（領域內）/ Application（跨功能副作用）/ Integration（外部：LINE/雲端）。資料同步走 Riverpod 反應式 provider（單一真相），事件只通知。
7. **同步友善**：所有實體帶 `createdAt/updatedAt/deletedAt/syncVersion`；**軟刪除**。
8. **memberId 範圍**；平台相依集中於 services；design token 單一來源；Feature Flag 控制未完成模組。

---

## 3. 技術選型（沿用 + 新增）

Riverpod｜**Drift(SQLite)**｜go_router｜flutter_local_notifications+timezone｜fl_chart＋自繪熱力圖｜home_widget｜csv/share_plus/file_picker｜計時時間戳法｜event_bus/StreamController｜logger｜uuid。
新增：`feature_flags`（簡單 config map）、`AppConfig`（flavor）、`AIContextBuilder`（純讀模型）。

---

## 4. Application 層：CQRS Lite（取代扁平 UseCase）

```
application/
  commands/   寫意圖 + Handler：RecordHabitCommand, AddHabitCommand,
              ArchiveHabitCommand, BackfillLogCommand, StartTimerCommand,
              PauseTimerCommand, StopTimerCommand, ImportDataCommand, AddFromTemplateCommand
  queries/    讀意圖 + Handler：GetTodayListQuery, GetHeatmapQuery,
              GetCumulativeQuery, GetHabitDetailQuery, SearchHabitsQuery
  handlers/   共用管線（pipeline）：寫入後 → 發 Domain Event → 寫 AuditLog
  controllers/ Riverpod Notifier：畫面只呼叫 Command/Query
```
**寫流**：`UI → Controller → Command.handle() → Repository → LocalDataSource(Drift)` → 發 Domain Event → 寫 AuditLog。
**讀流**：`UI / AIContextBuilder → Query.handle() → Repository.search(QueryObject)`（無副作用）。
> 保持「lite」：Handler 是普通類別、用 Riverpod 解析，不引入 mediator/命令匯流排。Command/Query 本質就是 v2 的 UseCase，只是拆成寫/讀兩類，順勢串起 Event Bus、Audit、AI Context。

---

## 5. 模組分解（v3）

### 共享層
- **core**：`event_bus`（三層事件）、`logger`、`errors`、`result`、`usecase`(Command/Query base)、`feature_flags`、日期/格式化。
- **config**：`AppConfig`（dev/staging/prod；Phase2 雲端端點）。
- **design_system**：tokens + 共用 widgets。
- **domain**：實體 + Repository 介面（`search(Query)`）+ Query 物件 + 純邏輯（完成/累計/達標/成就規則）。
- **data**：Repository 實作 + `*LocalDataSource(Drift)` + `*RemoteDataSource(預留)` + mappers + export(版本)。

### services
notification（含 NotificationAction）｜timer（status 狀態機）｜export｜analytics（摘要物化，後啟用）｜audit（寫 AuditLog）。

### features（四層）
today｜habit_editor｜timer｜stats｜history｜organize｜reminders｜onboarding｜backup｜quick_entry｜settings｜achievements（預留模型）｜**ai（context/prompts/agents/tools，結構先建）**
Phase 2：sync_line｜members

---

## 6. 專案結構

```
lib/
  core/
    event_bus/   { domain_event.dart, app_event.dart, integration_event.dart, bus.dart }
    cqrs/        { command.dart, query.dart, handler.dart }      # base（補11）
    feature_flags/                                               # 補6
    logger/  errors/  result/  utils/
  config/        app_config.dart  flavors.dart                   # 補7
  design_system/
  domain/
    entities/    # member, habit, log, timer_session, timer_profile, reminder,
                 #   category, tag, habit_template, achievement*, *_summary, audit_log
    queries/     # HabitQuery, LogQuery（Specification）         # 補1
    repositories/  # 介面：search(Query) / getById / upsert / softDelete
    logic/
  data/
    db/          # Drift tables + DAO（含 sync 欄位、deletedAt）
    sources/
      local/     # *LocalDataSource(Drift)
      remote/    # *RemoteDataSource(預留, Phase2)
    repositories/  # 組 local(+remote) 實作
    export/      # json/csv + envelope(schemaVersion, appVersion)
  services/
    notification/ timer/ export/ analytics/ audit/
  features/
    today/ { presentation/ application/ domain/ data/ }
    habit_editor/ timer/ stats/ history/ organize/ reminders/
    onboarding/ backup/ quick_entry/ settings/
    achievements/                 # 預留模型
    ai/                           # 補8
      context/    # AIContextBuilder（純讀，經 queries）
      prompts/  agents/  tools/
  app/           # go_router / ProviderScope / 主題 / 進入點
main.dart
```

---

## 7. 資料模型（v3，整合補缺 3,4,5,9,10）

```
# 同步基底（所有可同步實體都帶）              # 補9,10
SyncBase { createdAt, updatedAt, deletedAt?, syncVersion }

Member        : SyncBase { id, name }
Category      : SyncBase { id, memberId, name, color, order }
Tag           : SyncBase { id, memberId, name }

Habit         : SyncBase {
  id, memberId, name, emoji, color, order, archived,
  type:check|count|timer, unit, decimal, step,
  schedule:daily|anytime, goalDaily?, goalWeekly?, goalMonthly?, categoryId?
}
HabitTag      { habitId, tagId }

HabitReminder : SyncBase {
  id, habitId, time(HH:mm), enabled,
  rule: daily|weekdays|weekends|monthly|custom   # 補4（預設 daily，先不做 UI）
}
NotificationAction { id, scope, kind:done|inc|incStep|startTimer|snooze, value? }

Log           : SyncBase {
  id, habitId, memberId, date, amount, source:app|widget|notification|line, at, note?
}

TimerProfile  : SyncBase { id, name, habitId?|global, durationMin }   # 補3（番茄鐘/冥想…）
TimerSession  : SyncBase {
  id, habitId, memberId, profileId?, startedAt, endedAt?, accumulatedMs,
  status: running|paused|completed|cancelled
}

HabitTemplate { id, name, emoji, color, type, unit, decimal, step, goalDaily?, category, tags[] }

Achievement     { id, code, name, emoji, metric:count|minutes|distance, threshold }
AchievementRule { id, achievementId, scope:global|habit|category, window:total|year }
UserAchievement : SyncBase { id, memberId, achievementId, unlockedAt }

DailySummary/WeeklySummary/MonthlySummary { memberId, habitId, periodKey, total, completed? }  # 介面先行、後物化

AuditLog { id, memberId, action, entity, entityId, payload, at }     # 補5
```
**匯出封套**：`{ schemaVersion, appVersion, exportedAt, data:{...} }`
**查詢一律過濾** `deletedAt IS NULL`；刪除＝設 `deletedAt`（可同步、可恢復）。`archived`（使用者整理）與 `deletedAt`（生命週期/同步）語意分開。

---

## 8. 事件三層（補 2）

| 層 | 範例 | 用途 |
|---|---|---|
| Domain | HabitRecorded, HabitGoalReached, TimerCompleted, AchievementUnlocked | 領域內副作用（成就評估、摘要重算） |
| Application | TodayListChanged, WidgetRefreshRequested | 跨功能 UI/服務協調 |
| Integration | LineMessageSent, CloudSyncCompleted, AiContextRequested | 外部系統（LINE/雲端/AI） |

邊界：事件只「通知發生了什麼」，搬資料走 Riverpod 反應式 provider（單一真相）。

---

## 9. AI Context 層（補 8，C 級重點）

`feature_ai/context/AIContextBuilder` —— AI **不讀資料庫**，改呼叫 `queries/` 組裝結構化讀模型：
```
{ "habit":"閱讀", "last30Days":26, "totalMinutes":1200, "goalHitRate":0.74, "topHabits":[...] }
```
供 AI 教練 / LINE Agent / Claude Code / 其他 Agent **共用同一份 context**。`prompts/agents/tools` 放提示樣板、代理定義、可呼叫工具（即包成 tool 的 Command/Query）。

---

## 10. 「現在做｜現在預留」紀律（避免過度工程）

| 區塊 | 現在做 | 現在只預留 / 之後做 |
|---|---|---|
| CQRS commands/queries | ✅ 全功能走 | 進階 pipeline |
| Query 物件 | ✅ HabitQuery/LogQuery | 更多條件 |
| 事件三層 | ✅ 分類 + 主要事件 | Integration 實作 |
| Sync 欄位 + 軟刪除 | ✅ 欄位 + 過濾 | 同步演算法（Phase2） |
| DataSource 分離 | ✅ Local 實作 + Remote 介面 | Remote 實作 |
| Feature Flags | ✅ 簡版開關 | 遠端旗標 |
| AppConfig | ✅ flavor 最小 | 雲端端點 |
| AI Context | 結構骨架 | Builder 邏輯（Phase2） |
| TimerProfile | 模型 + 欄位 | 快速開始 UI |
| ReminderRule | 欄位（預設 daily） | weekday/monthly UI |
| Audit Log | 表 + Command 寫入 | 檢視 UI |
| Achievement | 模型 + 規則 | 評估器 + UI |
| Analytics 摘要 | 介面（從 Log 算） | 物化摘要表 |

---

## 11. 路線圖（v3）

- **P0 骨架**：core(event_bus 三層/cqrs base/feature_flags/logger/errors)、config(AppConfig)、design_system、Drift schema（**含 sync 欄位、deletedAt、所有預留表**）、Riverpod、go_router、DataSource 分離、匯出封套、空 feature_ai 結構。
- **P1 走骨架**：today（清單＋打卡/計量，經 `RecordHabitCommand`）＋ habit_editor＋持久化 → **每天可用**。
- **P2 計時**：timer（status 狀態機、並行、背景時間戳、到時通知；TimerProfile 模型備而不用）。
- **P3 目標/統計/成就規則**：日週月目標、stats（熱力圖＋趨勢＋累計，走 Query/AnalyticsRepository）、Achievement 規則評估（UI 後補）。
- **P4 補登/整理**：history（過去任一天，軟刪除）＋ organize（分類/標籤/拖曳/封存）。
- **P5 提醒**：reminders（多時段，rule 預設 daily）＋ notification（actions）。
- **P6 快速記錄**：通知快速按鈕 →（後）Android Widget。
- **P7 範本**：onboarding 用 HabitTemplate。
- **P8 匯出**：JSON/CSV（封版本）。
- **效能優化（按需）**：物化 *Summary。
- **打包**：簽章、build apk。
- **Phase 2（雲端/AI）**：RemoteDataSource 實作 + sync_line（Cloudflare Workers + Hono + D1，靠 sync 欄位做 last-write-wins/tombstone）+ members + feature_ai（AIContextBuilder/Agent，呼叫既有 Command/Query）。

---

## 12. 成熟度（回應審查）

補上 Query 物件、Sync Metadata、Soft Delete、AI Context、CQRS Lite 後，架構已具：APK／Cloudflare／LINE Bot／AI Coach／Agent／多成員／未來 Web 的支撐力，且**不需大規模重構**即可逐步演進——對應審查所指的 9.8 等級方向。關鍵在維持第 10 節紀律：結構先到位、行為按階段長出。

---

## 13. 下一步

建議產出 **P0 + P1 可 `flutter run` 骨架**：core(event_bus 三層 / cqrs base / feature_flags)、config、Drift schema（含 sync 欄位＋軟刪除＋預留表）、Local/Remote DataSource 分離、HabitQuery、空 feature_ai 結構、today + habit_editor 走 `RecordHabitCommand` / `GetTodayListQuery`。要我開工即可。
