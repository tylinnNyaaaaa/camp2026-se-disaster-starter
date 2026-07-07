import type { SiteStatus, SiteStatusReport } from "../contracts";

export type ExternalSiteStatusRecord = {
  site_id: string;
  site_name?: string;
  note: string;
  reporter: string;
  reported_at: string;
  status_guess: string;
};

/**
 * 只收錄語意清楚、無歧義的對應；其餘 status_guess 一律視為證據不足，
 * 不猜測，交給 needs_review。
 */
const statusGuessMap: Record<string, SiteStatus> = {
  open: "reported_open",
  closed: "reported_closed",
};

export type AdaptedSiteStatusResult =
  | { kind: "adapted"; record: SiteStatusReport }
  | { kind: "rejected"; reason: string; raw: ExternalSiteStatusRecord };

export function adaptExternalSiteStatus(
  input: ExternalSiteStatusRecord,
  knownSiteIds: readonly string[],
): AdaptedSiteStatusResult {
  if (!knownSiteIds.includes(input.site_id)) {
    return {
      kind: "rejected",
      reason: `siteId ${input.site_id} 不在目前已知的站點清單裡，無法建立對應的狀態建議`,
      raw: input,
    };
  }

  const timestamp = new Date(input.reported_at).toISOString();
  const mappedStatus = statusGuessMap[input.status_guess];

  return {
    kind: "adapted",
    record: {
      id: `event-1535-${input.site_id}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      // 外部來源可信度未知，一律先標記 needs_review，不論 status_guess 看起來多肯定
      sourceType: "volunteer_update",
      verificationStatus: "needs_review",
      siteId: input.site_id,
      suggestedStatus: mappedStatus ?? "needs_review",
      message: input.note,
      reportedByRole:
        input.reporter === "unknown" ? "未知回報者" : input.reporter,
    },
  };
}
