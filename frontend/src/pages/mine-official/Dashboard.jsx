import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import StatusBadge, { PriorityBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { inspectionService } from "../../services/inspectionService.js";
import { correctiveActionService } from "../../services/correctiveActionService.js";
import CreateActionModal from "../corrective-actions/CreateActionModal.jsx";
import AiIncidentModal from "../../components/incidents/AiIncidentModal.jsx";

export default function MineOfficialDashboard() {
  const { profile } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [violations, setViolations] = useState([]);
  const [correctiveActions, setCorrectiveActions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showActionModal, setShowActionModal] = useState(false);
  const [showAiVisionModal, setShowAiVisionModal] = useState(false);

  async function loadData() {
    try {
      const [inspData, violData, actData] = await Promise.all([
        inspectionService.getInspections(),
        correctiveActionService.getViolations().catch(() => []),
        correctiveActionService.getActions().catch(() => []),
      ]);
      setInspections(inspData || []);
      setViolations(violData || []);
      setCorrectiveActions(actData || []);
    } catch (err) {
      console.warn("Failed to load mine dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const pendingReviewCount = inspections.filter((i) => i.status === "submitted").length;
  const inProgressCount = inspections.filter((i) => ["assigned", "in_progress"].includes(i.status)).length;
  const reviewedCount = inspections.filter((i) => i.status === "reviewed").length;
  const openViolationsCount = violations.filter((v) => v.status !== "closed").length;

  const today = new Date().toISOString().split("T")[0];
  const overdueActionsCount = correctiveActions.filter(
    (a) => a.targetDate < today && !["verified", "closed"].includes(a.status)
  ).length;

  const awaitingReviews = inspections.filter((i) => i.status === "submitted");

  // Explainable AI Risk Score
  const criticalViolations = violations.filter((v) => v.severity === "critical").length;
  let calculatedRiskScore = 35 + criticalViolations * 18 + overdueActionsCount * 12 + openViolationsCount * 5;
  calculatedRiskScore = Math.min(Math.max(calculatedRiskScore, 24), 88);
  const riskLevel = calculatedRiskScore >= 70 ? "high" : calculatedRiskScore >= 45 ? "medium" : "low";

  return (
    <AppShell
      title={`Mine Operations — ${profile?.name || "Mine Official"}`}
      onInspectionCreated={() => loadData()}
    >
      {/* AI Incident Vision & Risk Banner */}
      <div className={`mb-6 rounded-xl border p-5 shadow-sm transition ${
        riskLevel === "high"
          ? "border-red-300 bg-gradient-to-r from-red-50/90 to-amber-50/50"
          : riskLevel === "medium"
          ? "border-amber-300 bg-gradient-to-r from-amber-50/90 to-orange-50/40"
          : "border-emerald-300 bg-gradient-to-r from-emerald-50/90 to-blue-50/40"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-lg text-white shadow-md ${
              riskLevel === "high" ? "bg-red-600" : riskLevel === "medium" ? "bg-amber-600" : "bg-emerald-600"
            }`}>
              AI
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-base text-ink">Mine AI Risk Assessment:</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${
                  riskLevel === "high"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : riskLevel === "medium"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}>
                  {riskLevel} Risk (Index {calculatedRiskScore}/100)
                </span>
              </div>
              <p className="text-xs text-slate mt-1">
                {criticalViolations > 0 && `${criticalViolations} critical non-conformances identified. `}
                {overdueActionsCount > 0 && `${overdueActionsCount} corrective actions past statutory fix deadline. `}
                {criticalViolations === 0 && overdueActionsCount === 0 && "Operational safety telemetry within normal DGMS compliance baseline."}
              </p>
            </div>
          </div>

          {/* AI Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowAiVisionModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Capture Incident (AI Vision)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowActionModal(true)}
              className="rounded-lg border border-border bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-xs hover:bg-slate-50 transition"
            >
              + Manual Action
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">Awaiting Review</p>
          <p className="mt-2 font-mono text-3xl font-bold text-amber-600">
            {loading ? "…" : pendingReviewCount}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">Active in Field</p>
          <p className="mt-2 font-mono text-3xl font-bold text-primary">
            {loading ? "…" : inProgressCount}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">Open Violations</p>
          <p className="mt-2 font-mono text-3xl font-bold text-red-600">
            {loading ? "…" : openViolationsCount}
          </p>
        </div>
        <div className="card">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">Overdue Actions</p>
          <p className="mt-2 font-mono text-3xl font-bold text-orange-600">
            {loading ? "…" : overdueActionsCount}
          </p>
        </div>
      </div>

      {/* Priority Review Queue */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">
              Submissions Awaiting Management Review ({awaitingReviews.length})
            </h2>
            <p className="text-xs text-slate">Field officer submissions requiring statutory review & endorsement.</p>
          </div>
          <Link
            to="/inspections?status=submitted"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Full Review Queue →
          </Link>
        </div>

        {loading ? (
          <div className="card text-center py-8 text-xs text-slate">Loading review queue…</div>
        ) : awaitingReviews.length === 0 ? (
          <div className="card text-center py-8 text-xs text-slate">
            No submitted inspections currently awaiting review.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
            <table className="min-w-full divide-y divide-border text-left text-xs">
              <thead className="bg-canvas font-semibold text-slate uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Inspection Title</th>
                  <th className="px-4 py-3">Zone</th>
                  <th className="px-4 py-3">Submitted By</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {awaitingReviews.map((insp) => (
                  <tr key={insp.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink">{insp.title}</div>
                      <div className="text-[11px] text-slate">{insp.type}</div>
                    </td>
                    <td className="px-4 py-3 text-slate">{insp.zone}</td>
                    <td className="px-4 py-3 font-medium text-ink">{insp.inspectorName}</td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={insp.priority} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/inspections/${insp.id}`}
                        className="inline-flex items-center gap-1 rounded bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
                      >
                        Review Findings →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Incident Vision Modal */}
      {showAiVisionModal && (
        <AiIncidentModal
          onClose={() => setShowAiVisionModal(false)}
          onDispatched={() => {
            setShowAiVisionModal(false);
            loadData();
          }}
        />
      )}

      {/* Manual Action Modal */}
      {showActionModal && (
        <CreateActionModal
          onClose={() => setShowActionModal(false)}
          onCreated={() => {
            setShowActionModal(false);
            loadData();
          }}
        />
      )}
    </AppShell>
  );
}
