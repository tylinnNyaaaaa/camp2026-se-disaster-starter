import { useMemo, useState } from "react";
import messyReports from "../fixtures/phase-0/messy-reports.json";
import reportsData from "../fixtures/shared/reports.json";
import sitesData from "../fixtures/shared/sites.json";
import siteStatusReportsData from "../fixtures/shared/site-status-reports.json";
import tasksData from "../fixtures/shared/tasks.json";
import assignmentsData from "../fixtures/shared/assignments.json";
import workspaceSitesData from "../fixtures/workspace/sites.json";
import workspaceSiteStatusReportsData from "../fixtures/workspace/site-status-reports.json";
import { RecordCard } from "../components/RecordCard";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Phase0Workbench } from "../features/phase-0/Phase0Workbench";
import { SiteStatusPanel } from "../features/site-status/SiteStatusPanel";
import { EventResponsePanel } from "../features/site-status/EventResponsePanel";
import { ReportIntakePanel } from "../features/reports/ReportIntakePanel";
import {
  assignmentsSchema,
  reportsSchema,
  siteStatusReportsSchema,
  sitesSchema,
  tasksSchema,
} from "../contracts";
import { safeParseFixture } from "../lib/load-fixture";

type TabKey = "messy" | "reports" | "sites" | "tasks" | "assignments";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "messy", label: "Phase 0 工作台" },
  { key: "reports", label: "通報" },
  { key: "sites", label: "地點" },
  { key: "tasks", label: "志工任務" },
  { key: "assignments", label: "人員指派" },
];

function parseAllFixtures() {
  const reports = safeParseFixture(
    reportsSchema,
    reportsData,
    "src/fixtures/shared/reports.json",
  );
  if (!reports.success) return reports;

  const sharedSites = safeParseFixture(
    sitesSchema,
    sitesData,
    "src/fixtures/shared/sites.json",
  );
  if (!sharedSites.success) return sharedSites;

  const workspaceSites = safeParseFixture(
    sitesSchema,
    workspaceSitesData,
    "src/fixtures/workspace/sites.json",
  );
  if (!workspaceSites.success) return workspaceSites;

  const sharedSiteStatusReports = safeParseFixture(
    siteStatusReportsSchema,
    siteStatusReportsData,
    "src/fixtures/shared/site-status-reports.json",
  );
  if (!sharedSiteStatusReports.success) return sharedSiteStatusReports;

  const workspaceSiteStatusReports = safeParseFixture(
    siteStatusReportsSchema,
    workspaceSiteStatusReportsData,
    "src/fixtures/workspace/site-status-reports.json",
  );
  if (!workspaceSiteStatusReports.success) return workspaceSiteStatusReports;

  const tasks = safeParseFixture(
    tasksSchema,
    tasksData,
    "src/fixtures/shared/tasks.json",
  );
  if (!tasks.success) return tasks;

  const assignments = safeParseFixture(
    assignmentsSchema,
    assignmentsData,
    "src/fixtures/shared/assignments.json",
  );
  if (!assignments.success) return assignments;

  return {
    success: true as const,
    data: {
      reports: reports.data,
      sites: [...sharedSites.data, ...workspaceSites.data],
      siteStatusReports: [
        ...sharedSiteStatusReports.data,
        ...workspaceSiteStatusReports.data,
      ],
      tasks: tasks.data,
      assignments: assignments.data,
    },
  };
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("messy");

  const parsed = useMemo(() => parseAllFixtures(), []);

  const records =
    parsed.success &&
    activeTab !== "messy" &&
    activeTab !== "sites" &&
    activeTab !== "reports"
      ? (() => {
          if (activeTab === "tasks") return parsed.data.tasks;
          return parsed.data.assignments;
        })()
      : [];

  return (
    <main className="layout">
      <header className="hero">
        <p className="eyebrow">SITCON Camp 2026</p>
        <h1>災害資訊積木起始專案</h1>
        <p>
          先面對混亂資料，再透過規格、資料格式、轉換器與測試，把前端原型做成可交接的資訊元件。
        </p>
      </header>

      {parsed.success ? (
        <nav className="tabs" aria-label="資料分類">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              type="button"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      ) : null}

      <section className="panel">
        {activeTab === "messy" ? (
          <>
            <div className="panel__header">
              <h2>{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
              <p>{messyReports.length} 筆資料</p>
            </div>
            <Phase0Workbench records={messyReports} />
          </>
        ) : activeTab === "reports" ? (
          !parsed.success ? (
            <ErrorState message={parsed.message} />
          ) : (
            <>
              <div className="panel__header">
                <h2>{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
              </div>
              <ReportIntakePanel reports={parsed.data.reports} />
            </>
          )
        ) : activeTab === "sites" ? (
          !parsed.success ? (
            <ErrorState message={parsed.message} />
          ) : (
            <>
              <div className="panel__header">
                <h2>{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
                <p>{parsed.data.sites.length} 筆資料</p>
              </div>
              <EventResponsePanel />
              <SiteStatusPanel
                sites={parsed.data.sites}
                statusReports={parsed.data.siteStatusReports}
              />
            </>
          )
        ) : !parsed.success ? (
          <ErrorState message={parsed.message} />
        ) : records.length === 0 ? (
          <EmptyState message="目前沒有資料" />
        ) : (
          <>
            <div className="panel__header">
              <h2>{tabs.find((tab) => tab.key === activeTab)?.label}</h2>
              <p>{records.length} 筆資料</p>
            </div>
            <div className="grid">
              {records.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
