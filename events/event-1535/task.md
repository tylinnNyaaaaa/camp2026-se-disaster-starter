# Task

分析 `incoming-data.json`，針對每一筆決定要用 adapter、擴充 schema、標記 `needs_review`，還是 reject。

不要立刻寫 code。先回答：

1. 這 3 筆各自哪裡不符合內部 schema？
2. 每一筆是格式差異、證據不足，還是根本無法辨識？
3. 進 demo 之後會不會被誤認為已確認事實？

決定策略後，才動手改 `src/adapters/`、`src/fixtures/workspace/` 與 UI。

## 必須交付

- 每一筆都要有明確處理結果（採用建議 / 標記需複查 / 拒絕），並在 demo 上看得到
- 至少 1 個測試涵蓋這批資料的處理邏輯
- `docs/decisions.md` 記錄這次的處理決策與理由
