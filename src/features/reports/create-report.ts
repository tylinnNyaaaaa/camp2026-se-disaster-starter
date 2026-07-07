import type { Report, ReportType, SourceType } from "../../contracts";

export type NewReportInput = {
  rawText: string;
  reportType: ReportType;
  sourceType: SourceType;
  reporterRole: string;
  locationText?: string;
};

/**
 * 使用者在畫面上自行新增的通報一律從 unverified 開始，
 * 且一律需要人工複查；不論表單填了什麼，都不能一送出就是已確認事實。
 */
export function createDraftReport(input: NewReportInput): Report {
  const now = new Date().toISOString();
  return {
    id: `local-${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
    sourceType: input.sourceType,
    verificationStatus: "unverified",
    reportType: input.reportType,
    rawText: input.rawText,
    reporterRole: input.reporterRole,
    locationText: input.locationText || undefined,
    needsManualReview: true,
  };
}
