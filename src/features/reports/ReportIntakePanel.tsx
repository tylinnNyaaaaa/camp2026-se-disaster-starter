import { useState } from "react";
import type { FormEvent } from "react";
import type { Report, ReportType, SourceType } from "../../contracts";
import { reportSchema, reportTypeSchema, sourceTypeSchema } from "../../contracts";
import { RecordCard } from "../../components/RecordCard";
import { EmptyState } from "../../components/EmptyState";
import { createDraftReport } from "./create-report";

const reportTypeLabels: Record<ReportType, string> = {
  human_need: "人的需求",
  supply_need: "物資需求",
  site_update: "地點狀態更新",
  task_update: "任務更新",
  unknown: "不確定類型",
};

const sourceTypeLabels: Record<SourceType, string> = {
  field_report: "現場回報",
  phone_call: "電話",
  social_post: "社群轉錄",
  official_notice: "官方公告",
  volunteer_update: "志工更新",
  mock: "模擬資料",
};

const emptyFormState = {
  rawText: "",
  reportType: "unknown" as ReportType,
  sourceType: "field_report" as SourceType,
  reporterRole: "",
  locationText: "",
};

export function ReportIntakePanel({ reports }: { reports: Report[] }) {
  const [submittedReports, setSubmittedReports] = useState<Report[]>([]);
  const [form, setForm] = useState(emptyFormState);
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const draft = createDraftReport({
      rawText: form.rawText,
      reportType: form.reportType,
      sourceType: form.sourceType,
      reporterRole: form.reporterRole,
      locationText: form.locationText || undefined,
    });

    const result = reportSchema.safeParse(draft);
    if (!result.success) {
      setErrors(result.error.issues.map((issue) => issue.message));
      return;
    }

    setErrors([]);
    setSubmittedReports((prev) => [result.data, ...prev]);
    setForm(emptyFormState);
  }

  const allReports = [...submittedReports, ...reports];

  return (
    <div className="report-intake">
      <form className="report-intake__form" onSubmit={handleSubmit}>
        <p className="report-intake__disclaimer">
          在這裡新增的通報只存在這個畫面的暫存狀態（重新整理會消失），一律從「未查核」開始，需要人工複查後才能進一步處理。
        </p>

        <label className="report-intake__field">
          原始內容
          <textarea
            required
            value={form.rawText}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, rawText: event.target.value }))
            }
            placeholder="例如：光復國小側門有人說需要飲用水"
          />
        </label>

        <div className="report-intake__row">
          <label className="report-intake__field">
            這比較像哪一種
            <select
              value={form.reportType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  reportType: event.target.value as ReportType,
                }))
              }
            >
              {reportTypeSchema.options.map((option) => (
                <option key={option} value={option}>
                  {reportTypeLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="report-intake__field">
            這筆是從哪裡來的
            <select
              value={form.sourceType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  sourceType: event.target.value as SourceType,
                }))
              }
            >
              {sourceTypeSchema.options.map((option) => (
                <option key={option} value={option}>
                  {sourceTypeLabels[option]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="report-intake__row">
          <label className="report-intake__field">
            回報者角色
            <input
              required
              type="text"
              value={form.reporterRole}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  reporterRole: event.target.value,
                }))
              }
              placeholder="例如：field_volunteer、resident"
            />
          </label>

          <label className="report-intake__field">
            地點描述（選填）
            <input
              type="text"
              value={form.locationText}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  locationText: event.target.value,
                }))
              }
              placeholder="例如：光復國小側門"
            />
          </label>
        </div>

        {errors.length > 0 ? (
          <ul className="report-intake__errors">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ) : null}

        <button type="submit">新增通報</button>
      </form>

      {allReports.length === 0 ? (
        <EmptyState message="目前沒有資料" />
      ) : (
        <div className="grid">
          {allReports.map((report) => (
            <RecordCard key={report.id} record={report} />
          ))}
        </div>
      )}
    </div>
  );
}
