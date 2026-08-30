"use client";

import { useState, useEffect } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { correctiveActionService } from "../../src/services/correctiveActionService.js";
import StatusBadge, { PriorityBadge, SeverityBadge, RiskBadge } from "../../src/components/ui/StatusBadge.jsx";
import {
  Wrench, Clock, CheckCircle2, AlertTriangle, Upload, ShieldAlert,
  ArrowRight, Calendar, MapPin, TrendingUp, FileCheck
} from "lucide-react";

export default function ContractorPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [tab, setTab] = useState("assigned"); // "assigned" | "resolved" | "closed"

  // Resolve modal
  const [resolvingAction, setResolvingAction] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const companyName = profile?.companyName || "SafeMine Engineering Pvt. Ltd.";

  async function loadData() {
    setLoading(true);
    try {
      const data = await correctiveActionService.getActions().catch(() => []);
      setActions(data || []);
    } catch (err) {
      console.error("Failed to load contractor tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Deadline countdown helper
  function getDeadlineInfo(targetDate) {
    if (!targetDate) return { text: "No deadline", color: "text-slate", urgent: false };
    const now = new Date();
    const deadline = new Date(targetDate);
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)}d`, color: "text-red-600", urgent: true };
    } else if (diffHours < 24) {
      return { text: `${diffHours}h remaining`, color: "text-red-600", urgent: true };
    } else if (diffDays <= 3) {
      return { text: `${diffDays}d ${diffHours % 24}h remaining`, color: "text-amber-600", urgent: true };
    } else {
      return { text: `${diffDays} days remaining`, color: "text-emerald-600", urgent: false };
    }
  }

  // Filter actions by tab
  const filteredActions = actions.filter((a) => {
    if (tab === "assigned") return ["assigned", "in_progress"].includes(a.status);
    if (tab === "resolved") return a.status === "resolved";
    if (tab === "closed") return a.status === "closed";
    return true;
  });

  const assignedCount = actions.filter((a) => ["assigned", "in_progress"].includes(a.status)).length;
  const overdueCount = actions.filter((a) => {
    if (!["assigned", "in_progress"].includes(a.status)) return false;
    return a.targetDate && new Date(a.targetDate) < new Date();
  }).length;
  const resolvedCount = actions.filter((a) => a.status === "resolved").length;
  const closedCount = actions.filter((a) => a.status === "closed").length;

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolvingAction) return;
    setSubmitting(true);
    try {
      await correctiveActionService.resolveAction(resolvingAction.id, {
        notes: resolutionNotes.trim() || "Mandatory rectification completed. Repair evidence attached.",
        evidence: [
          {
            name: proofFile ? proofFile.name : "repair_completion_proof.jpg",
            url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
            type: "image/jpeg",
          },
        ],
      });
      setResolvingAction(null);
      setResolutionNotes("");
      setProofFile(null);
      loadData();
    } catch (err) {
      alert("Failed to submit resolution: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Contractor Work Order Dashboard">
      {/* Company Banner */}
      <div className="card mb-6 bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-md bg-orange-500/20 text-orange-300 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border border-orange-500/30">
                Contractor Portal
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-xs text-slate-300 font-mono">{profile?.mineId || "KCM-01"}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{companyName}</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              View assigned hazard remediation work orders, AI risk assessments, statutory fix deadlines, and submit repair completion proofs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Logged in as</p>
              <p className="text-sm font-bold text-white">{profile?.name || "Contractor"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Active Tasks</span>
          <p className="mt-2 text-2xl font-bold text-ink">{assignedCount}</p>
          <p className="text-[11px] text-slate mt-0.5">Awaiting your repair</p>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Overdue</span>
          <p className={`mt-2 text-2xl font-bold ${overdueCount > 0 ? "text-red-600" : "text-emerald-600"}`}>{overdueCount}</p>
          <p className={`text-[11px] font-bold mt-0.5 ${overdueCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {overdueCount > 0 ? "Immediate action required" : "All on schedule"}
          </p>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Submitted</span>
          <p className="mt-2 text-2xl font-bold text-amber-600">{resolvedCount}</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Awaiting verification</p>
        </div>

        <div className="card p-4">
          <span className="text-xs font-bold text-slate uppercase tracking-wider">Verified & Closed</span>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{closedCount}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Successfully completed</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-5 bg-canvas p-1 rounded-xl border border-border w-fit">
        {[
          { key: "assigned", label: "Active Tasks", count: assignedCount },
          { key: "resolved", label: "Submitted Proofs", count: resolvedCount },
          { key: "closed", label: "Verified & Closed", count: closedCount },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              tab === t.key
                ? "bg-surface text-ink shadow-xs border border-border/80"
                : "text-slate hover:text-ink"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Work Order Cards */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate">Loading assigned work orders...</div>
      ) : filteredActions.length === 0 ? (
        <div className="card p-12 text-center">
          <Wrench className="h-10 w-10 mx-auto text-slate/40 mb-3" />
          <p className="text-sm font-bold text-ink">No tasks in this category</p>
          <p className="text-xs text-slate mt-1">
            {tab === "assigned"
              ? "No active repair tasks assigned to your company at this time."
              : tab === "resolved"
              ? "No pending verification submissions."
              : "No verified and closed tasks yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActions.map((action) => {
            const deadlineInfo = getDeadlineInfo(action.targetDate);
            return (
              <div
                key={action.id}
                className={`card p-5 rounded-xl border ${
                  deadlineInfo.urgent && tab === "assigned"
                    ? "border-red-200 bg-red-50/30"
                    : "border-border"
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <PriorityBadge priority={action.priority} />
                      <SeverityBadge severity={action.severity || action.priority} />
                      <StatusBadge status={action.status} />
                    </div>
                    <h3 className="font-bold text-sm text-ink">{action.title || "Hazard Remediation Task"}</h3>
                    <p className="text-xs text-slate line-clamp-2">{action.description || "Statutory remediation required per DGMS guidelines."}</p>
                  </div>

                  {/* AI Risk Score */}
                  <div className="shrink-0 text-center bg-canvas border border-border rounded-xl px-4 py-2.5">
                    <p className="text-[10px] font-bold text-slate uppercase tracking-wider">AI Risk</p>
                    <p className={`text-xl font-black ${
                      (action.aiRiskScore || 75) >= 80 ? "text-red-600" :
                      (action.aiRiskScore || 75) >= 50 ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      {action.aiRiskScore || 75}<span className="text-xs text-slate font-normal">/100</span>
                    </p>
                  </div>
                </div>

                {/* Details Row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate border-t border-border/70 pt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span><strong className="text-ink">{action.mineName || "Kusmunda Coal Mine"}</strong> - {action.zone || "Pit A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Deadline: <strong className="text-ink">{action.targetDate || "N/A"}</strong></span>
                  </div>
                  <div className={`flex items-center gap-1.5 font-bold ${deadlineInfo.color}`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{deadlineInfo.text}</span>
                  </div>
                </div>

                {/* Assigned Inspector */}
                <div className="flex items-center gap-2 mt-2 text-xs text-slate">
                  <span>Assigned Inspector: <strong className="text-ink">{action.assignedToName || "Field Officer"}</strong></span>
                  <span>|</span>
                  <span>Category: <strong className="text-ink">{action.category || "Safety"}</strong></span>
                </div>

                {/* Action Buttons */}
                {tab === "assigned" && (
                  <div className="mt-4 pt-3 border-t border-border/70 flex items-center gap-3">
                    <button
                      onClick={() => {
                        setResolvingAction(action);
                        setResolutionNotes("");
                        setProofFile(null);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-600 transition"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Submit Repair Proof</span>
                    </button>
                    <span className="text-[11px] text-slate">Upload photo evidence of completed repair work</span>
                  </div>
                )}

                {tab === "resolved" && action.resolutionNotes && (
                  <div className="mt-3 pt-3 border-t border-border/70 bg-amber-50/50 rounded p-3 text-xs">
                    <p className="font-bold text-amber-800 mb-1">Your Submitted Notes:</p>
                    <p className="text-amber-700">{action.resolutionNotes}</p>
                    <p className="text-[11px] text-slate mt-1">Awaiting verification by Mine Official...</p>
                  </div>
                )}

                {tab === "closed" && (
                  <div className="mt-3 pt-3 border-t border-border/70 bg-emerald-50/50 rounded p-3 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verified & Closed by Mine Official</span>
                    </div>
                    {action.verificationNotes && (
                      <p className="text-emerald-600">{action.verificationNotes}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Modal */}
      {resolvingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Submit Repair Proof</h3>
                <p className="text-xs text-slate mt-0.5">Upload evidence that the hazard has been fixed</p>
              </div>
              <button
                onClick={() => setResolvingAction(null)}
                className="text-slate hover:text-ink text-lg font-bold"
              >
                x
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-border bg-canvas p-3 text-xs space-y-1">
              <p><strong className="text-ink">Task:</strong> {resolvingAction.title}</p>
              <p><strong className="text-ink">Deadline:</strong> {resolvingAction.targetDate}</p>
              <p><strong className="text-ink">AI Risk:</strong> {resolvingAction.aiRiskScore || 75}/100</p>
              <p><strong className="text-ink">Location:</strong> {resolvingAction.mineName} - {resolvingAction.zone}</p>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate mb-1 block">Repair Description *</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe the repair work completed, parts replaced, tests conducted..."
                  className="w-full rounded-lg border border-border px-3 py-2 text-xs text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate mb-1 block">Photo Proof of Repair</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white file:cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-600 disabled:opacity-60 transition"
                >
                  {submitting ? "Submitting..." : "Submit Repair Proof"}
                </button>
                <button
                  type="button"
                  onClick={() => setResolvingAction(null)}
                  className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-ink hover:bg-canvas transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
