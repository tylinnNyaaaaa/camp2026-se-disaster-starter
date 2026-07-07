import { event1535Response } from "./event-response";

export function EventResponsePanel() {
  return (
    <div className="event-response-panel">
      <h3>15:35 Event 處理結果</h3>
      <p className="event-response-panel__intro">
        外部志工協調 App 匯出了 3 筆資料，皆非官方確認，處理結果如下：
      </p>
      <ul>
        {event1535Response.map((item) => (
          <li
            key={item.siteId}
            className={
              item.kind === "rejected"
                ? "event-response-item event-response-item--rejected"
                : "event-response-item event-response-item--adapted"
            }
          >
            <span className="event-response-item__site">{item.siteId}</span>
            <span className="event-response-item__label">
              {item.kind === "rejected" ? "已拒絕" : "已轉為建議"}
            </span>
            <span className="event-response-item__detail">
              {item.kind === "rejected" ? item.reason : item.summary}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
