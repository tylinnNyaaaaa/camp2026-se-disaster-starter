# Decisions

## DEC-001：

### Context

Starter repository commands and CI should use one package manager so students and agents do not split workflows.

### Options considered

- Keep the previous package-manager workflow.
- Use pnpm as the only documented and CI package manager.

### Decision

Use Node 24 and pnpm for install, scripts, lockfile, CI, and course documentation.

### Consequences

Contributors should use Node 24, then run `pnpm install` and `pnpm run check`. No alternate package manager is supported.

## DEC-002：主流程鎖定為 Line B（Site + SiteStatusReport）

### Context

Scope Lock 階段（`docs/tasks/05-scope-lock.md`）要求只選一條主流程往下做。三條線（Report 進線、Site 可信度、Task/Assignment 派工）starter repo 都已經有 schema 與範例 adapter。

### Options considered

- Line A（Report 進線）：延續 Phase 0 的分類體驗，但「如何轉成正式 Report」偏向資料輸入表單，AC 較難聚焦。
- Line C（Task/Assignment 派工）：需要同時處理 capacity、skill match、多重狀態機，範圍偏大，容易超出 Build Sprint 1 的時間。
- Line B（Site 可信度）：`course-context.md` 明講的核心規則「單一回報不能覆蓋已確認狀態」本身就是一條可以直接寫成程式邏輯、可以直接寫測試的 AC，範圍小而清楚。

### Decision

主流程鎖定為 Line B：`Site` 列表 + `SiteStatusReport` 建議，畫面規則是「已確認（verified）狀態不能被單一建議直接覆蓋」。

### Consequences

- `docs/spec.md`、`docs/data-contract.md`、`docs/user-flow.md` 都以這條主流程改寫
- 需要補 `src/fixtures/workspace/sites.json`、`site-status-reports.json`，因為 shared 只有 2 個站點、1 筆建議，不足以展示多種狀態與「verified 保護」情境
- Line A / Line C 的既有 tab（通報／志工任務／人員指派）維持原樣顯示，不在本次擴充範圍內

## DEC-003：verified 保護規則寫成純函式並直接測試

### Context

`course-context.md` 明確禁止 AI／系統「Override official or verified site state from one report」。這條規則如果只放在 UI component 裡，容易在之後改版時被不小心刪掉或繞過，而且不好驗證。

### Options considered

- 直接在 component 裡用 if 判斷要不要顯示「採用」按鈕，邏輯與畫面混在一起
- 抽成獨立、無 React 依賴的純函式（`src/features/site-status/decision-logic.ts`），可以單獨寫單元測試

### Decision

採用第二種：`availableActions` 決定當前狀態下可以做哪些動作，`applyAction` 執行動作並在嘗試對 verified 狀態「採用建議」時丟出例外。兩者都有對應測試（`tests/site-status-decision-logic.test.ts`）。

### Consequences

之後如果有人想在 verified 站點加上「採用」按鈕，測試會直接失敗，比較不容易在不知情的情況下破壞這條規則。

## DEC-004：Event 1535（外部志工協調 App 匯出）處理決策

### Context

模擬的 15:35 event（`events/event-1535/`）帶來 3 筆外部資料，欄位名稱、時間格式、狀態值都跟內部 schema 不一樣，其中一筆引用了一個不存在的站點 ID（`S-006`）。

### 逐筆決策

| 記錄 | 問題類型 | 決策 | 理由 |
| --- | --- | --- | --- |
| `S-005`（status_guess: open） | 格式差異（欄位名稱、`+08:00` 時區） | adapter | 語意已存在（`reported_open`），只是外部命名與時區不同 |
| `S-004`（status_guess: maybe_closed） | 證據不足 | 標記 `needs_review`，suggestedStatus 也給 `needs_review`，不猜測是 `reported_open` 還是 `reported_closed` | `maybe_closed` 本身含糊，硬猜一個狀態比誠實標示「不確定」更危險 |
| `S-006`（新站點） | 無法辨識 / 內部模型缺少對應站點 | reject，不建立 `Site` 或 `SiteStatusReport` | 這個站點不在任何 `sites.json` 裡；若直接生成一筆記錄等於無中生有一個「已知站點」，超出這批資料能證明的範圍 |

### Decision

- 新增 `src/adapters/external-site-status-import.ts`：純函式，包含「未知站點一律 reject」「模糊狀態一律 needs_review、不猜測」「一律標記 needs_review、不管來源看起來多篤定」三條規則
- 轉換後的兩筆合法建議，人工核對過 adapter 輸出後，寫入 `src/fixtures/workspace/site-status-reports.json`（`event-1535-S-005`、`event-1535-S-004`），並用測試鎖住「委交的資料與 adapter 輸出必須一致」
- 被拒絕的 `S-006` 不進入任何 normalized fixture，只在 `src/features/site-status/event-response.ts` 的處理摘要裡顯示拒絕原因，UI 由 `EventResponsePanel` 呈現
- 沒有擴充 `SiteStatus` 或新增欄位；現有 enum 已足夠表達這批資料的所有情境

### Consequences

- `events/event-1535/incoming-data.json` 本身沒有被匯入到任何會被打包進 demo 的程式碼裡（`event-response.ts` 是人工整理後的靜態摘要，不是即時讀取 events 檔案），維持「events/\*\* 是外部 dirty data」的邊界
- `S-005` 剛好也觸發既有的「重複建議」邏輯（外部說開放，內部本來就是 `reported_open`），第一次在真實資料上展示 `isDuplicateSuggestion`
- 下一步若要處理「同一站點多筆待確認建議」（例如未來又有人對 `S-001` 提出第二筆建議），需要先解決 `docs/handoff.md` 裡記錄的「目前只抓第一筆建議」限制

## DEC-005：「通報」頁籤加上自行新增通報的表單

### Context

使用者直接要求在「通報」頁籤加上讓人自己新增通報的機制。這超出原本 Scope Lock（DEC-002）鎖定的單一主流程（Line B / Site 可信度），但由使用者本人直接指定，不是我自己擴大範圍。

### Decision

在 `src/features/reports/` 加上 `ReportIntakePanel`（表單＋列表）與 `createDraftReport`（純函式）。規則：

- 新增的通報一律以 `verificationStatus: "unverified"`、`needsManualReview: true` 起始，使用者無法在表單上把它設成已確認
- 送出前用既有的 `reportSchema.safeParse` 驗證，不合法就顯示錯誤、不加入列表
- 只存在 React state（重新整理消失），不寫回 fixture、不使用 localStorage、不呼叫後端

### Consequences

- `docs/spec.md` 的主流程仍然是 Line B；這個表單是「通報」頁籤的獨立小功能，沒有另外寫一份完整 spec/AC，因為範圍很小且是使用者直接指定的功能，不是課程模擬情境下的第二條主流程
- 新增了 `tests/create-report.test.ts` 驗證「一律 unverified」與 schema 合法性
