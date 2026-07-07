# Event 1535：外部志工協調 App 匯出資料

## 這是什麼

一份模擬的外部匯出資料，來自另一個（虛構的）志工協調 App，內容是這個 App 使用者對幾個站點狀態的回報。這不是官方公告，也還沒有經過你們的內部流程確認。

## 檔案

- `incoming-data.json`：外部匯出的原始資料，欄位名稱與狀態值都跟內部 `Site` / `SiteStatusReport` schema 不一樣
- `task.md`：這次要做的事
- `notes-for-review.md`：幾個容易漏掉的細節

## 提醒

這份資料不能直接當作內部 `SiteStatusReport` 使用，也不能因為它「看起來很肯定」就標成 `verified`。
