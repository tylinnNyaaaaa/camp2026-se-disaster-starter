# Testing

測試不是為了追求覆蓋率，而是為了把完成條件（Acceptance Criteria，簡稱 AC）、schema 與 event injection 的處理決策變成可驗證的成果。

## Required checks

- [x] schema validation（`pnpm run validate:data`，含 shared 與 workspace）
- [x] one component or app smoke test（`tests/app-smoke.test.tsx`）
- [x] one edge case test（`tests/site-status-decision-logic.test.ts`：verified 狀態不可被覆蓋）
- [x] event injection 後至少一個 adapter / validation test（`tests/external-site-status-import.test.ts`）

## Commands

```bash
pnpm validate:data
pnpm test
pnpm check
```

## 完成條件（AC）對應測試

| 完成條件 | Test / manual check |
| -------- | ------------------- |
| AC-1     | `tests/site-status-decision-logic.test.ts`（型別/資料層）＋手動打開「地點」頁籤確認每張卡片顯示狀態、來源、最後確認時間 |
| AC-2     | 手動確認 S-001／S-003 卡片上的建議區塊標示「建議（尚未生效）」，且卡片主要 badge 不會直接變成建議狀態 |
| AC-3     | `tests/site-status-decision-logic.test.ts` 的 `availableActions`／`applyAction` 測試：verified 狀態不提供「採用」、嘗試採用會丟出例外 |
| AC-4     | 手動確認 S-007 卡片顯示「目前沒有待確認的建議」（S-004／S-005 在 event injection 之後已經各自有一筆建議了） |

## Event injection tests

`tests/external-site-status-import.test.ts` 涵蓋 `events/event-1535/incoming-data.json`：

- 引用不存在站點（`S-006`）會被拒絕，不會生成 `Site` 或 `SiteStatusReport`
- `+08:00` 時間會被轉成合法的 UTC datetime
- 語意清楚的 `status_guess`（`open`）會對應到正確的 `SiteStatus`
- 含糊的 `status_guess`（`maybe_closed`）不會被硬猜，一律 `needs_review`
- 轉換後一律 `verificationStatus: needs_review`，不論來源看起來多篤定
- `src/fixtures/workspace/site-status-reports.json` 裡手動寫入的兩筆 event 結果，必須跟 adapter 實際輸出一致（防止手動抄寫時打錯或漏改）

## Notes

- `events/**` 是外部 dirty input，不要求直接通過 validation。
- `src/fixtures/**` 是 normalized internal data，必須通過 validation。
- 若需要支援外部格式，優先新增 adapter 測試。
