# AI Log

這份紀錄用來留下小組如何使用 AI / Coding Agent 的操作脈絡。重點不是逐字保存所有 prompt，而是記錄重要協作、取捨與人類判斷。

## 什麼時候要記錄

請在以下情況更新本檔案：

- AI 協助釐清需求或產生 spec 草稿
- AI 協助設計 schema、adapter 或資料轉換策略
- AI 協助產生 UI、測試、README 或 handoff 文件
- AI 建議被小組拒絕，且拒絕原因和安全 / 正確性 / scope 有關
- AI 輸出可能造成誤導，例如把未確認資料寫成已確認事實
- event injection 後，AI 協助判斷 schema mismatch 或 adapter 策略

## 不需要記錄

- 不需要逐字貼完整 prompt
- 不需要記錄每一次小型 autocomplete
- 不需要記錄單純修 typo 或格式化

## 紀錄格式

| 時間 | 階段 | 任務 | AI / Agent 建議 | 採用 / 拒絕 | 人類判斷理由 | 相關檔案 / commit |
| ---- | ---- | ---- | --------------- | ----------- | ------------ | ----------------- |
| 2026-07-07 | Phase 0 | 把首頁改造成資訊整理工作台 | 建議左右兩欄版面：左邊列出 10 筆 `messy-reports.json` 原始資料，右邊逐筆標記分類建議、「還不知道怎麼判斷」與「為什麼不能直接變任務」的原因；分類選擇僅存在 React state（不寫回 fixture、不落地 localStorage） | 部分待確認 | UI 結構與元件重用（`StatusBadge`/`SourceLabel`）採用；但每筆的「不確定原因」文字是 AI 依原始文字表面推論寫入 `src/features/phase-0/annotations.ts`，尚未經小組核對是否貼近真實判斷盲點，需要復盤時逐筆確認 | `src/features/phase-0/Phase0Workbench.tsx`, `src/features/phase-0/annotations.ts`, `src/app/App.tsx` |
| 2026-07-07 | SDD-lite → Scope Lock | 選定主流程並寫 spec | AI 建議鎖定 Line B（Site + SiteStatusReport），把「verified 狀態不可被單一建議覆蓋」定為核心 AC，並提案用純函式（非 UI）承載這條規則以便測試 | 採用 | 這條規則在 `course-context.md` 已經是明文禁止項目，寫成可測試的純函式比只在 UI 判斷更不容易之後被誤刪；範圍也比 Line C（派工）小，適合 Build Sprint 1 的時間 | `docs/spec.md`, `docs/data-contract.md`, `docs/user-flow.md`, `docs/decisions.md` |
| 2026-07-07 | Build Sprint 1 | 實作 Site 狀態工作台 | AI 建議補 `src/fixtures/workspace/` 的站點與建議資料，涵蓋 verified_open/verified_closed 被建議覆蓋、reported_open 可採用、unknown 與無建議等情境；決策邏輯（`availableActions`/`applyAction`）與 UI 分開，並各寫測試 | 採用 | shared fixture 只有 2 站點、1 建議，無法展示 AC-3（verified 保護）與 AC-4（無建議）；把規則抽成純函式後可以直接針對「verified 不能被覆蓋」寫單元測試，不用等 UI render 才能驗證 | `src/fixtures/workspace/sites.json`, `src/fixtures/workspace/site-status-reports.json`, `src/features/site-status/decision-logic.ts`, `src/features/site-status/SiteStatusPanel.tsx`, `tests/site-status-decision-logic.test.ts` |
| 2026-07-07 | Event Injection | 模擬並處理 15:35 event（沒有真實 staff PR，AI 依現有 spec 自行編造一組合理的外部匯出資料） | AI 建議：`S-006`（不存在的站點）直接 reject，不生成任何 Site/SiteStatusReport；`maybe_closed` 這種含糊狀態不要猜成 reported_closed，一律 needs_review；轉換結果人工核對後再寫入 workspace fixture，並用測試鎖住兩者一致 | 採用，但保留人工核對步驟 | 這批 event 資料是 AI 模擬的，不是真的課堂 event，所以更需要留一個人工核對點（測試 `fixture 內容＝adapter 輸出`），避免「AI 編的資料」和「AI 轉換的結果」在沒人看過的情況下直接變成 demo 內容 | `events/event-1535/`, `src/adapters/external-site-status-import.ts`, `src/features/site-status/event-response.ts`, `src/features/site-status/EventResponsePanel.tsx`, `tests/external-site-status-import.test.ts`, `docs/decisions.md` DEC-004 |
| 2026-07-07 | 使用者直接要求 | 「通報」頁籤加上自己新增通報的表單 | AI 建議新增通報一律從 `unverified` + `needsManualReview: true` 起始，使用者無法在表單上選成已確認；送出前用既有 `reportSchema.safeParse` 驗證 | 採用 | 使用者自己填的資料本質上跟現場回報一樣不確定，不應該因為「是使用者自己在畫面上輸入的」就給予更高信任度；用實際瀏覽器操作（Playwright）驗證過新增、空白送出被 HTML 必填擋下兩種情境都正常 | `src/features/reports/ReportIntakePanel.tsx`, `src/features/reports/create-report.ts`, `tests/create-report.test.ts`, `docs/decisions.md` DEC-005 |

## 範例

| 時間  | 階段            | 任務             | AI / Agent 建議                                                   | 採用 / 拒絕 | 人類判斷理由                              | 相關檔案 / commit             |
| ----- | --------------- | ---------------- | ----------------------------------------------------------------- | ----------- | ----------------------------------------- | ----------------------------- |
| 09:45 | Phase 0         | 分析混亂資料     | 建議把社群貼文直接轉成 verified report                            | 拒絕        | 社群貼文來源未確認，應保持 `needs_review` | `docs/phase0-observations.md` |
| 15:50 | Event Injection | 處理外部任務資料 | 建議新增 adapter 將 `need_people: "10人"` 轉成 `peopleNeeded: 10` | 採用        | 這是外部格式差異，不應修改 `CommonRecord` | `src/adapters/...`            |

## 課後反思

### AI 幫助最大的地方

-

### AI 最容易誤導的地方

-

### 下次使用 AI 開發前，我們會先準備

-
