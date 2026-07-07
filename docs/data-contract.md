# Data Contract

## Inputs

| 來源 | 檔案 | Schema |
| --- | --- | --- |
| starter 內建 | `src/fixtures/shared/sites.json` | `sitesSchema` |
| starter 內建 | `src/fixtures/shared/site-status-reports.json` | `siteStatusReportsSchema` |
| 小組整理 | `src/fixtures/workspace/sites.json` | `sitesSchema` |
| 小組整理 | `src/fixtures/workspace/site-status-reports.json` | `siteStatusReportsSchema` |

UI 讀取時，`shared` 與 `workspace` 各自先通過 zod schema validation，再合併成同一份陣列供畫面使用（不合併驗證前的原始資料，任一份驗證失敗就顯示 `ErrorState`）。

補 `workspace` 的原因：`shared` 只有 2 個站點、1 筆建議，無法展示 AC-3 要求的「verified 狀態保護」與多種 `SiteStatus`。`workspace` 補了 3 個站點（涵蓋 `verified_closed`、`unknown`、`reported_open`）與 3 筆建議（涵蓋「建議想覆蓋 verified_open」「建議想覆蓋 verified_closed」「站點目前已是 needs_review 的建議」），並讓 2 個站點刻意沒有任何建議，用來展示 AC-4。

## Outputs

本次 demo 沒有任何輸出寫回檔案、後端或 localStorage。使用者在畫面上點擊「採用建議／標記需複查／駁回建議」後，只更新 React component state，用於畫面即時顯示結果；重新整理頁面會回到 fixture 原始狀態。

## Extended schema

沒有擴充 `Site` 或 `SiteStatusReport` 的 family schema。現有欄位（`status`、`suggestedStatus`、`verificationStatus`）已足以表達本次 AC，不需要新增欄位。

## Adapter decisions

Build Sprint 1 沒有新增 adapter；`sites` 與 `site-status-reports` 皆為 normalized data，直接通過既有 schema 使用。核心判斷邏輯（決定當前狀態下可以採取哪些動作、以及動作結果）放在 `src/features/site-status/decision-logic.ts`，是純 TypeScript 函式，不是 schema adapter，因為它不轉換外部格式，只是把「verified 狀態不可被單一建議覆蓋」這條規則寫成可測試的程式碼。

### Event 1535（`events/event-1535/`）

新增 `src/adapters/external-site-status-import.ts`，把外部志工協調 App 的匯出格式轉成內部 `SiteStatusReport`：

| 外部欄位 | 內部欄位 | 轉換規則 |
| --- | --- | --- |
| `site_id` | `siteId` | 直接對應；若不在已知站點清單則整筆 reject |
| `note` | `message` | 直接對應 |
| `reporter` | `reportedByRole` | `"unknown"` 轉成中文標示「未知回報者」，其餘原樣保留 |
| `reported_at`（`+08:00`） | `createdAt` / `updatedAt` | 轉成 UTC ISO 字串（`Z` 結尾）以符合 `z.string().datetime()` |
| `status_guess` | `suggestedStatus` | 只對應語意清楚的值（`open` → `reported_open`、`closed` → `reported_closed`）；其餘一律 `needs_review`，不猜測 |
| （固定） | `verificationStatus` | 一律 `needs_review`，不論外部資料語氣多肯定 |

沒有擴充 `SiteStatus` enum：`needs_review` 已足以表達「證據不足」的情況，不需要新欄位。

處理結果：

- `S-005`、`S-004` 轉換成功，寫入 `src/fixtures/workspace/site-status-reports.json`（`event-1535-S-005`、`event-1535-S-004`），由 `tests/external-site-status-import.test.ts` 鎖住「fixture 內容＝adapter 輸出」
- `S-006` 引用一個不存在的站點，reject，不產生任何 `Site` 或 `SiteStatusReport`；拒絕原因顯示在 `src/features/site-status/event-response.ts` → `EventResponsePanel`
- `events/event-1535/incoming-data.json` 本身不會被匯入到任何打包進 demo 的程式碼；`event-response.ts` 是人工核對 adapter 輸出後寫下的靜態摘要

外部資料不一定符合內部 schema。先寫 adapter，只有語意真的不足時才擴充 schema。
