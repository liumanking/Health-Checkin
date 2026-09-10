# CLAUDE.md — 習慣追蹤器 PWA

> 🪦 **本專案已退役（2026-09-10，治理層 ADR-0009）**：主線是 `L:\AI-Repos\Health_Checkin_V1`。
> 這裡只供設計參考，不要開發新功能、不要部署。詳見文末「當前階段」與 `STATUS.md`。

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

## 常用指令

- `npm run dev` — 開發伺服器
- `npm run typecheck` — TypeScript 檢查
- `npm run test` — Vitest 單元測試
- `npm run build` — typecheck + production build（含 PWA SW）

## ⛔ 當前階段：已停止更新（2026-08-15 Miles 裁定）

**主線已轉到 `L:\AI-Repos\Health_Checkin_V1`**（Flutter 原生 App，repo
`liumanking/Health_Checkin_V1`）。這個純前端 PWA 是它的前身，**只作為設計參考保留，
不再開發新功能**。

- **原本規劃的 Phase 2（雲端/AI）不會在這個 repo 做**，別在這裡動工——那是白工。
  雲端備份等能力由 Flutter 版實作。
- 舊資料：Miles 確認這個 PWA **沒有他實際在用的打卡資料**（資料只鎖在瀏覽器
  IndexedDB），所以 Flutter 版**不做**「從舊版 PWA 匯入」。
- 上一輪體檢（2026-08-15）：typecheck／test 16 項／build 全綠，
  部署版網址是 `health-checkin.liumanbobi.workers.dev`（`health-checkin.pages.dev` 是別人的
  App，不是這個專案）；2026-09-10 使用者裁決關閉，由使用者在 Cloudflare 後台停用。

設計書 P0~P8 主線當初已全數完成。效能優化：路由 code-split 已做（Recharts 拆到 Stats
專屬 chunk，首屏 bundle 1010KB→484KB）；DailySummary/WeeklySummary 物化按 Miles 決定
暫緩。
