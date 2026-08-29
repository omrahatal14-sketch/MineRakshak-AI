import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import StatusBadge, { PriorityBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { inspectionService } from "../../services/inspectionService.js";
import { correctiveActionService } from "../../services/correctiveActionService.js";

export default function FieldOfficerDashboard() {
  const { profile } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [correctiveActions, setCorrectiveActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [inspData, actionsData] = await Promise.all([
          inspectionService.getInspections(),
          correctiveActionService.getActions({ status: "all" }).catch(() => []),
        ]);
        setInspections(inspData || []);
        setCorrectiveActions(actionsData || []);
      } catch (err) {
        console.warn("Failed to load field officer dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const assignedCount = inspections.filter((i) => i.status === "assigned").length;
  const inProgressCount = inspections.filter((i) => i.status === "in_progress").length;
  const submittedCount = inspections.filter((i) => i.status === "submitted").length;
  const reviewedCount = inspections.filter((i) => i.status === "reviewed").length;

  const activeInspections = inspections.filter((i) =>
    ["assigned", "in_progress"].includes(i.status)
  );

  const pendingActions = correctiveActions.filter((a) =>
    ["assigned", "in_progress"].includes(a.status)
  );

  return (
    <AppShell title={`Welcome back, ${profile?.name || "Field Officer"}`}>
      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">New Assigned</p>
          <p className="mt-2 font-mono text-3xl font-bold text-primary">
            {loading ? "…" : assignedCount}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">In Progress Drafts</p>
          <p className="mt-2 font-mono text-3xl font-bold text-amber-600">
            {loading ? "…" : inProgressCount}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">Submitted for Review</p>
          <p className="mt-2 font-mono text-3xl font-bold text-blue-600">
            {loading ? "…" : submittedCount}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">Pending Actions</p>
          <p className="mt-2 font-mono text-3xl font-bold text-red-600">
            {loading ? "…" : pendingActions.length}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Inspections List (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink">Action Required: Assigned Inspections</h2>
              <p className="text-xs text-slate">Inspections awaiting ground execution and observation recording.</p>
            </div>
            <Link to="/inspections" className="text-xs font-semibold text-primary hover:underline">
              View All ({inspections.length}) →
            </Link>
          </div>

          {loading ? (
            <div className="card text-center py-8 text-xs text-slate">Loading assigned inspections…</div>
          ) : activeInspections.length === 0 ? (
            <div className="card text-center py-8 text-xs text-slate">
              All assigned field inspections have been completed and submitted.
            </div>
          ) : (
            <div className="space-y-3">
              {activeInspections.slice(0, 4).map((insp) => (
                <div
                  key={insp.id}
                  className="card flex flex-col justify-between border-l-4 border-l-primary hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-ink">{insp.title}</h3>
                      <p className="mt-0.5 text-xs text-slate">
                        {insp.mineName} • <span className="font-medium text-ink">{insp.zone}</span>
                      </p>
                    </div>
                    <PriorityBadge priority={insp.priority} />
                  </div>

                  <p className="mt-2 text-xs text-slate line-clamp-2">
                    {insp.summary || "Complete physical safety inspection, log hazards, and attach photo evidence."}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={insp.status} />
                      <span className="font-mono text-[11px] text-slate">Due: {insp.scheduledDate}</span>
                    </div>

                    <Link
                      to={`/inspections/${insp.id}/conduct`}
                      className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
                    >
                      Conduct Inspection →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Corrective Actions Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink">My Corrective Actions</h2>
            <Link to="/corrective-actions" className="text-xs font-semibold text-primary hover:underline">
              View All ({correctiveActions.length}) →
            </Link>
          </div>

          {loading ? (
            <div className="card text-center py-6 text-xs text-slate">Loading actions…</div>
          ) : pendingActions.length === 0 ? (
            <div className="card text-center py-6 text-xs text-slate">
              No outstanding corrective action items.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingActions.slice(0, 3).map((act) => (
                <div key={act.id} className="card p-3 border-l-3 border-l-red-500 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink truncate max-w-[180px]">{act.title}</span>
                    <PriorityBadge priority={act.priority} />
                  </div>
                  <p className="mt-1 text-[11px] text-slate line-clamp-2">{act.description}</p>
                  <div className="mt-2 flex items-center justify-between pt-2 border-t border-border/60">
                    <span className="font-mono text-[10px] text-slate">Due: {act.targetDate}</span>
                    <Link
                      to="/corrective-actions"
                      className="text-primary font-semibold hover:underline text-[11px]"
                    >
                      Resolve Proof →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
