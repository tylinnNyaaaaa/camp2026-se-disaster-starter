# Notes for Review

給檢查這批資料的人幾個提醒：

- `reported_at` 帶了 `+08:00` 時區，內部 schema 的 `datetime` 欄位是 UTC（`Z` 結尾），直接塞進去會過不了 validation。
- `status_guess` 的值（`open` / `maybe_closed` / `new`）沒有一個直接對應到內部 `SiteStatus` enum，`maybe_closed` 尤其含糊，不要直接猜成 `reported_closed`。
- 第三筆 `site_id: "S-006"` 不在目前任何 `sites.json`（`shared` 或 `workspace`）裡，代表這是一個我們還不認識的站點，不能無中生有建一個 `verified` 或甚至 `unverified` 的 `Site` record 出來。
- `reporter: "unknown"` 那一筆，來源角色本身就不確定，不要預設它比較不可信或比較可信，就是標記需要複查。
- 這批資料如果被「採用」，也絕對不能讓任何一個目前是 `verified_open` / `verified_closed` 的站點被直接覆蓋。
