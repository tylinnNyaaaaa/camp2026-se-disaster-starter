import { useState } from "react";
import type { Site, SiteStatusReport } from "../../contracts";
import { StatusBadge } from "../../components/StatusBadge";
import { SourceLabel } from "../../components/SourceLabel";
import { formatDateTime } from "../../lib/date";
import {
  applyAction,
  availableActions,
  isDuplicateSuggestion,
  type SiteAction,
  type SiteActionResult,
} from "./decision-logic";

export function SiteStatusPanel({
  sites,
  statusReports,
}: {
  sites: Site[];
  statusReports: SiteStatusReport[];
}) {
  const [decisions, setDecisions] = useState<Record<string, SiteActionResult>>(
    {},
  );

  function suggestionFor(siteId: string): SiteStatusReport | undefined {
    return statusReports.find((report) => report.siteId === siteId);
  }

  function handleAction(site: Site, suggestion: SiteStatusReport, action: SiteAction) {
    const result = applyAction(site, suggestion, action);
    setDecisions((prev) => ({ ...prev, [site.id]: result }));
  }

  return (
    <div className="site-status-panel">
      {sites.map((site) => {
        const suggestion = suggestionFor(site.id);
        const decision = decisions[site.id];
        const displayStatus = decision?.status ?? site.status;
        const duplicate =
          suggestion && !decision
            ? isDuplicateSuggestion(site, suggestion)
            : false;

        return (
          <article key={site.id} className="site-status-card">
            <div className="site-status-card__header">
              <div>
                <h3>{site.name}</h3>
                <p className="site-status-card__address">
                  {site.addressText ?? "地址未提供"}
                </p>
              </div>
              <StatusBadge status={displayStatus} />
            </div>

            <div className="site-status-card__meta">
              <SourceLabel sourceType={site.sourceType} />
              <span>最後確認：{formatDateTime(site.lastConfirmedAt)}</span>
            </div>

            {!suggestion ? (
              <p className="site-status-card__no-suggestion">
                目前沒有待確認的建議
              </p>
            ) : decision ? (
              <p className="site-status-card__decision-note">
                {decision.note}
              </p>
            ) : (
              <div className="site-status-card__suggestion">
                <div className="site-status-card__suggestion-header">
                  <span className="site-status-card__suggestion-label">
                    建議（尚未生效）
                  </span>
                  <StatusBadge status={suggestion.verificationStatus} />
                </div>
                <p>{suggestion.message}</p>
                <p className="site-status-card__suggestion-meta">
                  建議者：{suggestion.reportedByRole} ・ 建議狀態：
                  <StatusBadge status={suggestion.suggestedStatus} />
                </p>

                {duplicate ? (
                  <p className="site-status-card__duplicate-note">
                    建議與目前狀態相同，僅供留意
                  </p>
                ) : (
                  <div className="site-status-card__actions">
                    {availableActions(site.status).map((option) => (
                      <button
                        key={option.action}
                        type="button"
                        onClick={() =>
                          handleAction(site, suggestion, option.action)
                        }
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
