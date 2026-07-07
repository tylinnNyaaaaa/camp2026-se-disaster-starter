export type EventResponseItem =
  | { kind: "adapted"; siteId: string; summary: string }
  | { kind: "rejected"; siteId: string; reason: string };

/**
 * 15:35 event injection（`events/event-1535/`）的處理結果摘要。
 * 這是人工審視 `adaptExternalSiteStatus` 的輸出後寫下的結論，不是把
 * `events/**` 的原始 dirty data 直接匯入 demo；對應的測試在
 * `tests/external-site-status-import.test.ts`。
 */
export const event1535Response: EventResponseItem[] = [
  {
    kind: "adapted",
    siteId: "S-005",
    summary:
      "外部回報「開放」與目前狀態相同，已轉為待確認建議（重複建議，僅供留意）",
  },
  {
    kind: "adapted",
    siteId: "S-004",
    summary:
      "外部回報狀態含糊（原文：可能已經沒水），已轉為需人工複查的建議，不猜測實際狀態",
  },
  {
    kind: "rejected",
    siteId: "S-006",
    reason: "siteId 不在目前已知的站點清單裡，無法建立對應的狀態建議",
  },
];
