# features/ai（預留結構，flag: ai = false）

AI 層骨架，Phase 2 實作。依賴方向：AI 只透過 application 層的 Command/Query 存取資料。

- `context/` — AIContextBuilder：組使用者習慣脈絡給模型
- `prompts/` — 提示樣板
- `agents/` — 代理定義
- `tools/` — 工具（包裝 Command/Query）
