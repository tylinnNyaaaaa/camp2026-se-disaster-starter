# Handoff

## How to run

```bash
pnpm install
pnpm run dev
```

打開後預設顯示「Phase 0 工作台」，點「地點」頁籤看主流程（Site 狀態可信度）。

## 主流程從哪裡進入

`src/main.tsx` → `src/app/App.tsx`（「地點」頁籤）→ `src/features/site-status/SiteStatusPanel.tsx`

資料來源：`src/fixtures/shared/sites.json` + `src/fixtures/workspace/sites.json`（合併顯示），建議資料同理合併 `site-status-reports.json`。

## 已完成的完成條件（AC）

- [x] AC-1：每個站點卡片顯示狀態、來源、最後確認時間
- [x] AC-2：待確認建議標示「建議（尚未生效）」，不會直接變成主要狀態
- [x] AC-3：verified_open / verified_closed 的站點只提供「標記需複查」「駁回建議」，不提供「採用建議」（`src/features/site-status/decision-logic.ts` + `tests/site-status-decision-logic.test.ts`）
- [x] AC-4：沒有建議的站點顯示「目前沒有待確認的建議」

## Event injection response（`events/event-1535/`）

沒有真的 staff PR，這是 AI 依現有 spec 模擬的一組外部資料（`events/event-1535/`），已經處理完畢：

- `S-005`、`S-004`：透過 `src/adapters/external-site-status-import.ts` 轉換成 `needs_review` 建議，寫入 `src/fixtures/workspace/site-status-reports.json`
- `S-006`：引用一個不存在的站點，reject，沒有生成任何內部記錄
- demo 上「地點」頁籤最上方的 `EventResponsePanel` 會顯示這 3 筆的處理結果
- 決策細節與逐筆理由見 `docs/decisions.md` DEC-004

## 通報自行新增（「通報」頁籤）

`src/features/reports/ReportIntakePanel.tsx` 讓使用者在畫面上直接填表新增通報，一律從「未查核」起始並強制需要人工複查，送出前會跑 `reportSchema` 驗證。只存在 React state，重新整理會消失。

## Known issues

- 新增的通報跟人工決策一樣，只存在 React state，重新整理頁面會回到 fixture 原始狀態，不會持久化（依課程規則不能用後端或 localStorage）
- 目前假設每個站點最多只有一筆待確認建議；若同一站點有多筆建議，畫面只會抓到第一筆（`suggestionFor` 用 `find`），這是刻意縮小的 scope，未處理排隊邏輯
- Phase 0 工作台（`src/features/phase-0/`）的判斷阻礙文字（`annotations.ts`）是 AI 草稿，尚未經小組逐項核對是否符合真實判斷盲點
- 尚未串接 `src/fixtures/released/1050/`（staff 課中才會釋出），目前資料完全來自 `shared` + `workspace`
- 本機 git `core.autocrlf=true` 會讓 `pnpm run format:check` 對 85 個未實際變更的檔案報錯（純換行符號問題）；已設定這個 repo 的 `core.autocrlf=false`，但磁碟上舊檔案還沒被轉成 LF，需要跑一次 `git diff --name-only | tr '\n' '\0' | xargs -0 dos2unix`

## Important files

- `docs/spec.md`：完整 spec、AC、狀態、demo path
- `docs/data-contract.md`：資料輸入輸出、adapter 規則、為什麼要補 workspace fixture
- `docs/decisions.md`：DEC-002（選 Line B）、DEC-003（verified 保護寫成純函式）、DEC-004（event 1535 逐筆決策）
- `src/features/site-status/decision-logic.ts`：核心規則（verified 不可被覆蓋），有獨立單元測試
- `src/features/site-status/SiteStatusPanel.tsx`：主流程 UI
- `src/features/site-status/EventResponsePanel.tsx`：event 處理結果摘要 UI
- `src/adapters/external-site-status-import.ts`：event 1535 的 adapter
- `src/features/phase-0/Phase0Workbench.tsx`：Phase 0 工作台 UI

## Suggested next task

- 核對並改寫 `docs/phase0-observations.md` 與 `src/features/phase-0/annotations.ts` 裡 AI 草擬的「判斷阻礙」文字，換成小組自己的觀察
- 設計「同一站點多筆建議」的排隊／優先順序規則（目前是 out of scope，`S-001` 已經有一筆 workspace 建議，之後若再收到第二筆會被目前的 `find` 邏輯忽略）
- 跑 `git diff --name-only | tr '\n' '\0' | xargs -0 dos2unix` 清掉 CRLF，讓 `pnpm run check` 完整通過
