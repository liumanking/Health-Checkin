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

## 當前階段：P0（骨架）已完成，待 Miles 驗收後進入 P1
