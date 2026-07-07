import { describe, expect, it } from "vitest";
import incomingData from "../events/event-1535/incoming-data.json";
import workspaceSiteStatusReports from "../src/fixtures/workspace/site-status-reports.json";
import {
  adaptExternalSiteStatus,
  type ExternalSiteStatusRecord,
} from "../src/adapters/external-site-status-import";
import { siteStatusReportSchema } from "../src/contracts";

const knownSiteIds = ["S-001", "S-002", "S-003", "S-004", "S-005"];
const records = incomingData as ExternalSiteStatusRecord[];

describe("adaptExternalSiteStatus", () => {
  it("rejects records that reference an unknown site instead of inventing one", () => {
    const s006 = records.find((record) => record.site_id === "S-006")!;
    const result = adaptExternalSiteStatus(s006, knownSiteIds);
    expect(result.kind).toBe("rejected");
  });

  it("converts a +08:00 timestamp to a schema-valid UTC datetime", () => {
    const s005 = records.find((record) => record.site_id === "S-005")!;
    const result = adaptExternalSiteStatus(s005, knownSiteIds);
    if (result.kind !== "adapted") throw new Error("expected adapted result");
    expect(() => siteStatusReportSchema.parse(result.record)).not.toThrow();
    expect(result.record.createdAt.endsWith("Z")).toBe(true);
  });

  it("maps a clear status_guess to the matching internal status", () => {
    const s005 = records.find((record) => record.site_id === "S-005")!;
    const result = adaptExternalSiteStatus(s005, knownSiteIds);
    if (result.kind !== "adapted") throw new Error("expected adapted result");
    expect(result.record.suggestedStatus).toBe("reported_open");
  });

  it("does not guess a specific status for an ambiguous status_guess", () => {
    const s004 = records.find((record) => record.site_id === "S-004")!;
    const result = adaptExternalSiteStatus(s004, knownSiteIds);
    if (result.kind !== "adapted") throw new Error("expected adapted result");
    expect(result.record.suggestedStatus).toBe("needs_review");
  });

  it("always marks the adapted result as needs_review, never verified", () => {
    for (const record of records) {
      const result = adaptExternalSiteStatus(record, knownSiteIds);
      if (result.kind === "adapted") {
        expect(result.record.verificationStatus).toBe("needs_review");
      }
    }
  });

  it("matches the normalized records committed to src/fixtures/workspace/site-status-reports.json", () => {
    for (const record of records) {
      const result = adaptExternalSiteStatus(record, knownSiteIds);
      if (result.kind !== "adapted") continue;
      const committed = workspaceSiteStatusReports.find(
        (report) => report.id === result.record.id,
      );
      expect(committed).toEqual(result.record);
    }
  });
});
