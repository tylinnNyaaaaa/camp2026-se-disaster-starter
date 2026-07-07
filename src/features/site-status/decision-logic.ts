import type { Site, SiteStatus, SiteStatusReport } from "../../contracts";
import { labelForStatus } from "../../components/status-labels";

export type SiteAction = "adopt" | "flag_review" | "dismiss";

export type SiteActionOption = {
  action: SiteAction;
  label: string;
};

const verifiedStatuses: SiteStatus[] = ["verified_open", "verified_closed"];

/**
 * verified_open / verified_closed 不能被單一建議直接覆蓋，
 * 所以這兩種狀態不提供「採用建議」的選項。
 */
export function availableActions(
  currentStatus: SiteStatus,
): SiteActionOption[] {
  const options: SiteActionOption[] = [];
  if (!verifiedStatuses.includes(currentStatus)) {
    options.push({ action: "adopt", label: "採用建議" });
  }
  options.push({ action: "flag_review", label: "標記需複查" });
  options.push({ action: "dismiss", label: "駁回建議" });
  return options;
}

export type SiteActionResult = {
  status: SiteStatus;
  note: string;
};

export function applyAction(
  site: Site,
  suggestion: SiteStatusReport,
  action: SiteAction,
): SiteActionResult {
  if (action === "adopt") {
    if (verifiedStatuses.includes(site.status)) {
      throw new Error(
        "已確認（verified）狀態不能被單一建議直接覆蓋，請改用標記需複查。",
      );
    }
    return {
      status: suggestion.suggestedStatus,
      note: `已依建議採用為「${labelForStatus(suggestion.suggestedStatus)}」`,
    };
  }
  if (action === "flag_review") {
    return {
      status: "needs_review",
      note: "已標記為需要人工複查，尚未變更為建議狀態",
    };
  }
  return {
    status: site.status,
    note: "已駁回此建議，狀態維持不變",
  };
}

export function isDuplicateSuggestion(
  site: Site,
  suggestion: SiteStatusReport,
): boolean {
  return site.status === suggestion.suggestedStatus;
}
