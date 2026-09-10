# STATUS

## 目前狀態
🪦 **已退役**（2026-09-10，治理層 ADR-0009 批准）：打卡主線是 Flutter 版
`L:\AI-Repos\Health_Checkin_V1`，這個網頁版 PWA 只作為設計參考保留，不再開發、不再部署。
（2026-08-15 起已停止更新；**Phase 2（雲端/AI）不在這裡做**。）

- repo 不刪、不搬、不封存——要看當初的設計直接讀程式碼即可。
- 線上版 `https://health-checkin.liumanbobi.workers.dev/`（Cloudflare Worker `health-checkin`）
  依使用者裁決**要關閉**，由使用者本人在 Cloudflare 後台停用；關閉確認前網址可能仍打得開。
- 復活方式：治理層 BOARD 加回一列（使用者決定）→ `npm run build` → `wrangler deploy`。

## 最後更新
2026-09-10 by Claude Code（專案退役 SOP 第 2 步）

## 本輪任務
無，且不會再有。2026-08-15 做過一次收尾體檢：typecheck 通過、`vitest` 16 項全過、
production build 通過（SW 正常、36 項 precache）、mobile 視口實際走過主流程
（建習慣→打卡→重整持久化→計時→統計→補登）皆正常，console 0 錯誤。

部署版網址已確認是 `health-checkin.liumanbobi.workers.dev`（2026-08-20 從治理層 BOARD 查得）；
照 `wrangler.jsonc` 的 name 推測的 `health-checkin.pages.dev` 是**別人的 App**，不是這個專案。

⚠️ Miles 確認本 repo **沒有他實際在用的打卡資料**，因此 Flutter 版不做
「從舊版 PWA 匯入」。

## 審查紀錄
（Codex / 替補審查者 / 使用者的紀錄，最新在上，退回必附理由）
