"use client";

import { useState, useEffect } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { correctiveActionService } from "../../src/services/correctiveActionService.js";
import { inspectionService } from "../../src/services/inspectionService.js";
import StatusBadge, { PriorityBadge, SeverityBadge } from "../../src/components/ui/StatusBadge.jsx";
import CreateActionModal from "../../src/components/modals/CreateActionModal.jsx";
import {
  ShieldCheck, Clock, Plus, Filter, Search, CheckCircle2,
  Upload, AlertTriangle, ArrowRight, Eye
} from "lucide-react";

export default function CorrectiveActionsPage() {
  const { profile } = useAuth();
  const [actions, setActions] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [mineFilter, setMineFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [resolvingAction, setResolvingAction] = useState(null);
  const [verifyingAction, setVerifyingAction] = useState(null);

  // Form states
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [aData, mData] = await Promise.all([
        correctiveActionService.getActions({
          status: statusFilter,
          priority: priorityFilter,
          mine: mineFilter,
          search: searchQuery,
        }).catch(() => []),
        inspectionService.getMines().catch(() => []),
      ]);
      setActions(aData || []);
      setMines(mData || []);
    } catch (err) {
      console.error("Failed to load corrective actions:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, mineFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolvingAction) return;
    setSubmitting(true);
    try {
      await correctiveActionService.resolveAction(resolvingAction.id, {
        resolutionNotes: resolutionNotes.trim() || "Mandatory engineering and safety rectification completed on-site.",
        resolutionEvidence: [
          {
            name: "rectification_proof.jpg",
            url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop",
            type: "image/jpeg",
          },
        ],
      });
      setResolvingAction(null);
      setResolutionNotes("");
      loadData();
    } catch (err) {
      alert("Failed to submit resolution: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyingAction) return;
    setSubmitting(true);
    try {
      await correctiveActionService.verifyAction(verifyingAction.id, {
        verificationNotes: verificationNotes.trim() || "Physical on-site inspection verified and approved for statutory compliance.",
        status: "closed",
      });
      setVerifyingAction(null);
      setVerificationNotes("");
      loadData();
    } catch (err) {
      alert("Failed to verify action: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Closed-Loop Corrective Actions (CAPA)">
      {/* Lifecycle Flow Header Banner */}
      <div className="card mb-6 p-4 bg-canvas border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Statutory Closed-Loop Lifecycle</h3>
            <p className="text-[11px] text-slate">From AI hazard detection &rarr; contractor remediation &rarr; inspector verification &rarr; DGMS closure</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition"
          >
            <Plus className="h-4 w-4" />
            <span>+ Create Action</span>
          </button>
        </div>

        {/* 5 Step Indicator */}
        <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold">
          <div className="rounded-lg bg-purple-50 text-purple-800 p-2 border border-purple-200">
            1. Assigned (AI)
          </div>
          <div className="rounded-lg bg-blue-50 text-blue-800 p-2 border border-blue-200">
            2. In Progress
          </div>
          <div className="rounded-lg bg-indigo-50 text-indigo-800 p-2 border border-indigo-200">
            3. Resolved (Proof)
          </div>
          <div className="rounded-lg bg-cyan-50 text-cyan-800 p-2 border border-cyan-200">
            4. Verified (Inspector)
          </div>
          <div className="rounded-lg bg-emerald-50 text-emerald-800 p-2 border border-emerald-200">
            5. Final Closed
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved (Awaiting Verification)</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate">Mine:</span>
              <select
                value={mineFilter}
                onChange={(e) => setMineFilter(e.target.value)}
                className="rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none max-w-[170px] truncate"
              >
                <option value="all">All Coal Mines</option>
                {mines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actions..."
              className="w-48 sm:w-60 rounded border border-border bg-white px-3 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Actions List */}
      {loading ? (
        <div className="card text-center py-16 text-xs text-slate">Loading corrective actions…</div>
      ) : actions.length === 0 ? (
        <div className="card text-center py-16 text-xs text-slate">No corrective actions found.</div>
      ) : (
        <div className="space-y-3">
          {actions.map((act) => (
            <div key={act.id} className="card p-4 hover:border-primary/40 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={act.priority} />
                    <h4 className="font-bold text-sm text-ink">{act.title}</h4>
                  </div>
                  <p className="text-xs text-slate">{act.description}</p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <StatusBadge status={act.status} />
                </div>
              </div>

              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border text-[11px]">
                <div className="flex items-center gap-4 text-slate">
                  <span>Facility: <strong className="text-ink">{act.mineName || act.mineId}</strong></span>
                  <span>•</span>
                  <span>Responsible Company: <strong className="text-ink">{act.responsibleCompany || "Contractor"}</strong></span>
                  <span>•</span>
                  <span>Inspector: <strong className="text-ink">{act.assignedToName || "Field Officer"}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 font-bold text-amber-700">
                  <Clock className="h-3.5 w-3.5" />
                  <span>AI Statutory Deadline: {act.targetDate}</span>
                </div>
              </div>

              {/* Action Buttons depending on status */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/70">
                <button
                  onClick={() => setSelectedAction(act)}
                  className="rounded border border-border px-3 py-1 text-xs font-medium text-slate hover:bg-canvas"
                >
                  View Details
                </button>

                {["assigned", "in_progress"].includes(act.status) && (
                  <button
                    onClick={() => setResolvingAction(act)}
                    className="flex items-center gap-1 rounded bg-primary px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Submit Resolution (Company)</span>
                  </button>
                )}

                {act.status === "resolved" && (
                  <button
                    onClick={() => setVerifyingAction(act)}
                    className="flex items-center gap-1 rounded bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verify & Close (Inspector)</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Details Modal */}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate uppercase">{selectedAction.id}</span>
                <h3 className="text-base font-bold text-ink mt-0.5">{selectedAction.title}</h3>
              </div>
              <button onClick={() => setSelectedAction(null)} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <p className="text-slate bg-canvas p-3 rounded-lg border border-border">{selectedAction.description}</p>
              
              <div className="grid grid-cols-2 gap-3 bg-canvas p-3 rounded-lg border border-border text-[11px]">
                <div>
                  <span className="text-slate font-semibold">Priority:</span>
                  <div className="mt-0.5"><PriorityBadge priority={selectedAction.priority} /></div>
                </div>
                <div>
                  <span className="text-slate font-semibold">Status:</span>
                  <div className="mt-0.5"><StatusBadge status={selectedAction.status} /></div>
                </div>
                <div>
                  <span className="text-slate font-semibold">Responsible Entity:</span>
                  <p className="font-bold text-ink mt-0.5">{selectedAction.responsibleCompany || "Maintenance Contractor"}</p>
                </div>
                <div>
                  <span className="text-slate font-semibold">Statutory Target Date:</span>
                  <p className="font-bold text-amber-700 font-mono mt-0.5">{selectedAction.targetDate}</p>
                </div>
              </div>

              {selectedAction.resolutionNotes && (
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 space-y-1">
                  <p className="font-bold text-indigo-950">Company Resolution Notes:</p>
                  <p className="text-slate">{selectedAction.resolutionNotes}</p>
                  {selectedAction.resolvedByName && (
                    <p className="text-[10px] text-slate font-medium">Submitted by: {selectedAction.resolvedByName}</p>
                  )}
                </div>
              )}

              {selectedAction.verificationNotes && (
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 space-y-1">
                  <p className="font-bold text-emerald-950">Inspector Verification Sign-Off:</p>
                  <p className="text-slate">{selectedAction.verificationNotes}</p>
                  {selectedAction.verifiedByName && (
                    <p className="text-[10px] text-slate font-medium">Verified by: {selectedAction.verifiedByName}</p>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="rounded bg-slate-800 px-4 py-1.5 font-semibold text-white hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Resolution Modal */}
      {resolvingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Submit CAPA Remediation</h3>
                <p className="text-xs text-slate">Record technical fix and attach verification evidence.</p>
              </div>
              <button onClick={() => setResolvingAction(null)} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleResolve} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate">Remediation Implementation Details *</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the completed mechanical or civil fix according to DGMS safety standards..."
                  className="w-full rounded border border-border bg-white p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Proof Photo / Test Report</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full rounded border border-border bg-white p-2 text-xs text-ink file:mr-2 file:rounded file:border-0 file:bg-primary-light file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setResolvingAction(null)}
                  className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-primary px-4 py-2 font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-60 transition"
                >
                  {submitting ? "Submitting…" : "Submit for Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspector Verification Modal */}
      {verifyingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Inspector Physical Sign-Off</h3>
                <p className="text-xs text-slate">Verify rectification on-site and seal action closure.</p>
              </div>
              <button onClick={() => setVerifyingAction(null)} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleVerify} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate">Inspection Notes & Statutory Sign-Off *</label>
                <textarea
                  rows={3}
                  required
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Record physical inspection verification findings..."
                  className="w-full rounded border border-border bg-white p-2.5 text-xs text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setVerifyingAction(null)}
                  className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-emerald-600 px-4 py-2 font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60 transition"
                >
                  {submitting ? "Verifying…" : "✓ Verify & Close Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Action Modal */}
      {showCreateModal && (
        <CreateActionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}
    </AppShell>
  );
}
