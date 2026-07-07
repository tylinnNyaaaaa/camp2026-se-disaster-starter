export type TriageCategory =
  | "site_status"
  | "report"
  | "task"
  | "assignment"
  | "unclear";

export const triageCategoryOptions: Array<{
  key: TriageCategory;
  label: string;
}> = [
  { key: "site_status", label: "地點狀態" },
  { key: "report", label: "通報" },
  { key: "task", label: "志工任務" },
  { key: "assignment", label: "人員指派" },
  { key: "unclear", label: "不確定類型" },
];

const assignmentPattern = /派人|工班|派工|名單/;
const taskPattern = /(需要|缺).{0,6}(人|人手|清淤|協助)/;
const siteStatusPattern =
  /站|中心|集合點|道路|封閉|入口|河堤|側門|淹水|物資|雨鞋|飲用水|水電/;
const reportPattern = /需要|缺|藥|老人家|電話/;

/**
 * 用關鍵字比對猜測這筆原始文字比較像哪一種類別。這是自動、粗略的猜測，
 * 不是對內容真偽或優先順序的判斷；來源與查核狀態仍然照原樣顯示，
 * 不會因為分類猜對了就被當成已確認事實。
 */
export function classifyRawText(rawText: string): TriageCategory {
  if (assignmentPattern.test(rawText)) return "assignment";
  if (taskPattern.test(rawText)) return "task";
  if (siteStatusPattern.test(rawText)) return "site_status";
  if (reportPattern.test(rawText)) return "report";
  return "unclear";
}
