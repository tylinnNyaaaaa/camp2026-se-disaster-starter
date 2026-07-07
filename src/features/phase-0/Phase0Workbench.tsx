import { RecordCard } from "../../components/RecordCard";
import { EmptyState } from "../../components/EmptyState";
import { classifyRawText, triageCategoryOptions } from "./classify";

export type MessyRecord = {
  id: string;
  rawText: string;
  sourceType: string;
  verificationStatus: string;
  updatedAt: string;
};

export function Phase0Workbench({ records }: { records: MessyRecord[] }) {
  return (
    <div className="phase0-workbench">
      {triageCategoryOptions.map((option) => {
        const group = records.filter(
          (record) => classifyRawText(record.rawText) === option.key,
        );
        if (group.length === 0) return null;

        return (
          <section key={option.key} className="phase0-category-section">
            <h3>
              {option.label}
              <span className="phase0-category-section__count">
                {group.length} 筆
              </span>
            </h3>
            <div className="grid">
              {group.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          </section>
        );
      })}

      {records.length === 0 ? (
        <EmptyState message="目前沒有資料" />
      ) : null}
    </div>
  );
}
