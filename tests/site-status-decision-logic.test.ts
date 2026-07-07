import { describe, expect, it } from "vitest";
import type { Site, SiteStatusReport } from "../src/contracts";
import {
  applyAction,
  availableActions,
  isDuplicateSuggestion,
} from "../src/features/site-status/decision-logic";

function makeSite(overrides: Partial<Site> = {}): Site {
  return {
    id: "S-TEST",
    createdAt: "2026-07-20T00:00:00Z",
    updatedAt: "2026-07-20T00:00:00Z",
    sourceType: "official_notice",
    verificationStatus: "verified",
    name: "測試站點",
    siteType: "shelter",
    status: "verified_open",
    ...overrides,
  };
}

function makeSuggestion(
  overrides: Partial<SiteStatusReport> = {},
): SiteStatusReport {
  return {
    id: "SSR-TEST",
    createdAt: "2026-07-20T00:00:00Z",
    updatedAt: "2026-07-20T00:00:00Z",
    sourceType: "volunteer_update",
    verificationStatus: "needs_review",
    siteId: "S-TEST",
    suggestedStatus: "reported_closed",
    message: "有人說可能關閉了",
    reportedByRole: "field_volunteer",
    ...overrides,
  };
}

describe("availableActions", () => {
  it("never offers 'adopt' for verified sites", () => {
    const verifiedOpen = availableActions("verified_open");
    const verifiedClosed = availableActions("verified_closed");
    expect(verifiedOpen.some((option) => option.action === "adopt")).toBe(
      false,
    );
    expect(verifiedClosed.some((option) => option.action === "adopt")).toBe(
      false,
    );
  });

  it("offers 'adopt' for non-verified sites", () => {
    const reportedOpen = availableActions("reported_open");
    expect(reportedOpen.some((option) => option.action === "adopt")).toBe(
      true,
    );
  });
});

describe("applyAction", () => {
  it("refuses to adopt a suggestion on a verified site", () => {
    const site = makeSite({ status: "verified_open" });
    const suggestion = makeSuggestion();
    expect(() => applyAction(site, suggestion, "adopt")).toThrow();
  });

  it("adopts the suggested status on a non-verified site", () => {
    const site = makeSite({ status: "reported_open" });
    const suggestion = makeSuggestion({ suggestedStatus: "reported_closed" });
    const result = applyAction(site, suggestion, "adopt");
    expect(result.status).toBe("reported_closed");
  });

  it("flags a verified site for review instead of overriding it", () => {
    const site = makeSite({ status: "verified_open" });
    const suggestion = makeSuggestion();
    const result = applyAction(site, suggestion, "flag_review");
    expect(result.status).toBe("needs_review");
  });

  it("keeps the original status when a suggestion is dismissed", () => {
    const site = makeSite({ status: "verified_closed" });
    const suggestion = makeSuggestion();
    const result = applyAction(site, suggestion, "dismiss");
    expect(result.status).toBe("verified_closed");
  });
});

describe("isDuplicateSuggestion", () => {
  it("detects when the suggested status matches the current status", () => {
    const site = makeSite({ status: "reported_open" });
    const suggestion = makeSuggestion({ suggestedStatus: "reported_open" });
    expect(isDuplicateSuggestion(site, suggestion)).toBe(true);
  });

  it("returns false when statuses differ", () => {
    const site = makeSite({ status: "reported_open" });
    const suggestion = makeSuggestion({ suggestedStatus: "reported_closed" });
    expect(isDuplicateSuggestion(site, suggestion)).toBe(false);
  });
});
