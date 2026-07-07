import { describe, expect, it } from "vitest";
import { createDraftReport } from "../src/features/reports/create-report";
import { reportSchema } from "../src/contracts";

describe("createDraftReport", () => {
  it("always starts as unverified and needing manual review", () => {
    const report = createDraftReport({
      rawText: "有人在光復國小側門說需要飲用水",
      reportType: "human_need",
      sourceType: "official_notice",
      reporterRole: "resident",
    });
    expect(report.verificationStatus).toBe("unverified");
    expect(report.needsManualReview).toBe(true);
  });

  it("produces a record that passes reportSchema", () => {
    const report = createDraftReport({
      rawText: "測試通報內容",
      reportType: "unknown",
      sourceType: "mock",
      reporterRole: "tester",
      locationText: "測試地點",
    });
    expect(() => reportSchema.parse(report)).not.toThrow();
  });

  it("rejects an empty rawText when validated against reportSchema", () => {
    const report = createDraftReport({
      rawText: "",
      reportType: "unknown",
      sourceType: "mock",
      reporterRole: "tester",
    });
    const result = reportSchema.safeParse(report);
    expect(result.success).toBe(false);
  });
});
