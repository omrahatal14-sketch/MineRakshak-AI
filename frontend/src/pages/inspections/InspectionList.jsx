import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import StatusBadge, { PriorityBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { inspectionService } from "../../services/inspectionService.js";

export default function InspectionList() {
  const { profile } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMine, setSelectedMine] = useState("all");
  const [mines, setMines] = useState([]);

  async function loadInspections() {
    setLoading(true);
    setError(null);
    try {
      const [inspData, minesData] = await Promise.all([
        inspectionService.getInspections({
          status: activeTab,
          mine: selectedMine,
          search: searchTerm,
        }),
        inspectionService.getMines().catch(() => []),
      ]);
      setInspections(inspData || []);
      setMines(minesData || []);
    } catch (err) {
      setError(err.message || "Failed to load inspections");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInspections();
  }, [activeTab, selectedMine]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadInspections();
  };

  const counts = {
    all: inspections.length,
    assigned: inspections.filter((i) => i.status === "assigned").length,
    in_progress: inspections.filter((i) => i.status === "in_progress").length,
    submitted: inspections.filter((i) => i.status === "submitted").length,
    reviewed: inspections.filter((i) => i.status === "reviewed").length,
  };

  const isFieldOfficer = profile?.role === "field_officer";
  const isMineOfficial = profile?.role === "mine_official";

  return (
    <AppShell
      title={isFieldOfficer ? "My Assigned Inspections" : "Statutory Inspections"}
      onInspectionCreated={() => loadInspections()}
    >
      {/* Search & Filter Bar */}
      <div className="card mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3 md:border-b-0 md:pb-0">
            {[
              { id: "all", label: "All Inspections" },
              { id: "assigned", label: "Assigned" },
              { id: "in_progress", label: "In Progress" },
              { id: "submitted", label: "Submitted" },
              { id: "reviewed", label: "Reviewed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-xs"
                    : "bg-canvas text-slate hover:bg-slate-200/60 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Mine Select Form */}
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
            {mines.length > 0 && !profile?.mineId && (
              <select
                value={selectedMine}
                onChange={(e) => setSelectedMine(e.target.value)}
                className="rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
              >
                <option value="all">All Mines</option>
                {mines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search title, zone, ID..."
                className="w-48 sm:w-60 rounded border border-border bg-white px-3 py-1.5 text-xs text-ink placeholder:text-slate/40 focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Table or Card List */}
      {error && (
        <div className="mb-4 rounded bg-red-50 p-4 text-xs text-status-overdue border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="card flex h-60 items-center justify-center text-slate">
          <div className="flex flex-col items-center gap-2 text-xs">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Loading inspections…
          </div>
        </div>
      ) : inspections.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-ink">No inspections match the current filters</p>
          <p className="mt-1 text-xs text-slate max-w-sm">
            {activeTab !== "all"
              ? `There are no inspections currently marked as '${activeTab}'.`
              : isFieldOfficer
              ? "You do not have any assigned inspections right now. When a Mine Official schedules an inspection for you, it will appear here."
              : "No inspections recorded matching the search criteria."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
          <table className="min-w-full divide-y divide-border text-left text-xs">
            <thead className="bg-canvas font-semibold text-slate uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Inspection</th>
                <th className="px-4 py-3">Mine & Zone</th>
                <th className="px-4 py-3">Assigned Inspector</th>
                <th className="px-4 py-3">Scheduled Date</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {inspections.map((insp) => {
                const canConduct =
                  isFieldOfficer &&
                  insp.inspectorId === profile?.uid &&
                  ["assigned", "in_progress"].includes(insp.status);

                const canReview =
                  (isMineOfficial || ["corporate", "admin"].includes(profile?.role)) &&
                  insp.status === "submitted";

                return (
                  <tr key={insp.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink">{insp.title}</div>
                      <div className="mt-0.5 text-[11px] text-slate">{insp.type || "Safety Audit"}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-ink">{insp.mineName || insp.mineId}</div>
                      <div className="text-[11px] text-slate">{insp.zone || "Main Pit"}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-ink">{insp.inspectorName || "Unassigned"}</div>
                      <div className="text-[11px] text-slate">Field Officer</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate">
                      {insp.scheduledDate || "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={insp.priority || "medium"} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={insp.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {canConduct ? (
                        <Link
                          to={`/inspections/${insp.id}/conduct`}
                          className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
                        >
                          Conduct Inspection
                        </Link>
                      ) : canReview ? (
                        <Link
                          to={`/inspections/${insp.id}`}
                          className="inline-flex items-center gap-1 rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-700 transition"
                        >
                          Review Submission
                        </Link>
                      ) : (
                        <Link
                          to={`/inspections/${insp.id}`}
                          className="inline-flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs font-medium text-slate hover:bg-canvas hover:text-ink transition"
                        >
                          View Details
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
