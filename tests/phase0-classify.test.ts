import { describe, expect, it } from "vitest";
import messyReports from "../src/fixtures/phase-0/messy-reports.json";
import { classifyRawText } from "../src/features/phase-0/classify";

const expected: Record<string, string> = {
  "M-001": "task",
  "M-002": "site_status",
  "M-003": "site_status",
  "M-004": "site_status",
  "M-005": "site_status",
  "M-006": "site_status",
  "M-007": "report",
  "M-008": "site_status",
  "M-009": "assignment",
  "M-010": "assignment",
};

describe("classifyRawText", () => {
  it("classifies every Phase 0 messy record as expected", () => {
    for (const record of messyReports) {
      expect(classifyRawText(record.rawText)).toBe(expected[record.id]);
    }
  });

  it("falls back to 'unclear' when no keyword matches", () => {
    expect(classifyRawText("今天天氣很好")).toBe("unclear");
  });

  it("prioritizes assignment keywords over task/site keywords", () => {
    expect(classifyRawText("工班說可以支援清淤，站在門口等")).toBe(
      "assignment",
    );
  });
});
