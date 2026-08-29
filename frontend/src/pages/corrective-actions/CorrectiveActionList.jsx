import { useState, useEffect } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import StatusBadge, { PriorityBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { correctiveActionService } from "../../services/correctiveActionService.js";
import { uploadEvidenceFile } from "../../services/storageService.js";
import CreateActionModal from "./CreateActionModal.jsx";

export default function CorrectiveActionList() {
  const { profile } = useAuth();
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resolveActionModal, setResolveActionModal] = useState(null);
  const [verifyActionModal, setVerifyActionModal] = useState(null);

  // Form states for Resolve Modal
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolutionFiles, setResolutionFiles] = useState([]);
  const [resolving, setResolving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Form states for Verify Modal
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationDecision, setVerificationDecision] = useState("closed");
  const [verifying, setVerifying] = useState(false);

  const canManageActions = ["mine_official", "admin", "corporate"].includes(profile?.role);
  const isFieldOfficer = profile?.role === "field_officer";

  async function loadActions() {
    setLoading(true);
    setError(null);
    try {
      const data = await correctiveActionService.getActions({
        status: activeTab,
        priority: priorityFilter,
        search: searchQuery,
      });
      setActions(data || []);
    } catch (err) {
      setError(err.message || "Failed to load corrective actions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActions();
  }, [activeTab, priorityFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadActions();
  };

  // Upload resolution evidence photos
  const handleResolutionFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const promises = files.map((f) => uploadEvidenceFile(f, `actions/${resolveActionModal.id}`));
      const uploaded = await Promise.all(promises);
      setResolutionFiles((prev) => [...prev, ...uploaded]);
    } catch (err) {
      alert("Failed to upload proof photo: " + err.message);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      alert("Please provide resolution/rectification notes.");
      return;
    }
    setResolving(true);
    try {
      await correctiveActionService.resolveAction(resolveActionModal.id, {
        notes: resolutionNotes.trim(),
        evidence: resolutionFiles,
      });
      setResolveActionModal(null);
      setResolutionNotes("");
      setResolutionFiles([]);
      loadActions();
    } catch (err) {
      alert("Error submitting resolution: " + err.message);
    } finally {
      setResolving(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      await correctiveActionService.verifyAction(verifyActionModal.id, {
        status: verificationDecision,
        notes: verificationNotes.trim(),
      });
      setVerifyActionModal(null);
      setVerificationNotes("");
      loadActions();
    } catch (err) {
      alert("Error verifying action: " + err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AppShell title="Corrective Actions & Hazard Remediation Tracker">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs text-slate">
            Track, assign, and verify on-ground remediation for statutory mine infractions.
          </p>
        </div>
        {canManageActions && (
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 rounded bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
          >
            + Create Corrective Action
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-xs text-status-overdue border border-red-200">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Actions" },
              { id: "assigned", label: "Assigned" },
              { id: "in_progress", label: "In Progress" },
              { id: "resolved", label: "Resolved (Awaiting Verification)" },
              { id: "closed", label: "Closed / Verified" },
              { id: "overdue", label: "Overdue" },
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

          {/* Priority & Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded border border-border bg-white px-2.5 py-1 text-xs text-ink focus:border-primary focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <input
              type="text"
              placeholder="Search title, mine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded border border-border bg-white px-2.5 py-1 text-xs text-ink focus:border-primary focus:outline-none w-44"
            />
            <button
              type="submit"
              className="rounded border border-border bg-canvas px-3 py-1 text-xs font-semibold text-slate hover:bg-slate-200"
            >
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* Action Cards List */}
      {loading ? (
        <div className="card flex items-center justify-center py-16 text-center text-xs text-slate">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Loading corrective actions…
          </div>
        </div>
      ) : actions.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-ink">No corrective actions found</p>
          <p className="mt-1 text-xs text-slate max-w-sm">
            {activeTab !== "all"
              ? `There are no corrective actions matching the filter '${activeTab}'.`
              : "All corrective actions are currently closed and up to date."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((act) => {
            const today = new Date().toISOString().split("T")[0];
            const isOverdue = act.targetDate < today && !["verified", "closed"].includes(act.status);

            const canResolve =
              (isFieldOfficer || canManageActions) &&
              ["assigned", "in_progress"].includes(act.status);

            const canVerify =
              canManageActions &&
              act.status === "resolved";

            return (
              <div
                key={act.id}
                className={`card relative transition border-l-4 ${
                  isOverdue
                    ? "border-l-red-600 bg-red-50/20"
                    : act.status === "resolved"
                    ? "border-l-amber-500 bg-amber-50/20"
                    : act.status === "closed"
                    ? "border-l-emerald-500 bg-surface"
                    : "border-l-primary bg-surface"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-ink">{act.title}</span>
                      <span className="text-xs text-slate">• {act.mineName} ({act.zone})</span>
                      <PriorityBadge priority={act.priority} />
                      <StatusBadge status={act.status} />
                      {isOverdue && (
                        <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase animate-pulse">
                          Overdue
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-ink leading-relaxed whitespace-pre-wrap">
                      {act.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate">
                      <span>
                        Assigned Inspector: <strong className="text-ink">{act.assignedToName}</strong>
                      </span>
                      {act.responsibleCompany && (
                        <span>
                          Responsible Company: <strong className="text-primary font-semibold">{act.responsibleCompany}</strong>
                        </span>
                      )}
                      <span>
                        Fix Deadline:{" "}
                        <strong className={`font-mono ${isOverdue ? "text-red-600 font-bold" : "text-ink"}`}>
                          {act.targetDate}
                        </strong>
                      </span>
                      <span>
                        Category: <strong className="text-ink">{act.category}</strong>
                      </span>
                      {act.aiRiskScore && (
                        <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
                          AI Risk: {act.aiRiskScore}/100
                        </span>
                      )}
                    </div>

                    {/* Resolution Section if resolved */}
                    {act.resolutionNotes && (
                      <div className="mt-3 rounded bg-blue-50/80 p-3 text-xs text-blue-950 border border-blue-200">
                        <div className="flex items-center justify-between font-bold text-[11px] text-blue-900 mb-1">
                          <span>Rectification Notes:</span>
                          <span className="font-mono text-[10px]">
                            {act.resolvedAt ? new Date(act.resolvedAt._seconds ? act.resolvedAt._seconds * 1000 : act.resolvedAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p>{act.resolutionNotes}</p>
                        {act.resolutionEvidence && act.resolutionEvidence.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {act.resolutionEvidence.map((ev, i) => (
                              <a
                                key={i}
                                href={ev.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded border border-blue-300 bg-white px-2 py-0.5 text-[10px] font-medium text-primary hover:underline"
                              >
                                Proof #{i + 1} ({ev.name})
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification Section if verified/closed */}
                    {act.verificationNotes && (
                      <div className="mt-2 rounded bg-emerald-50/80 p-2.5 text-xs text-emerald-950 border border-emerald-200">
                        <span className="font-bold text-emerald-900">Official Verification: </span>
                        {act.verificationNotes} ({act.verifiedByName || "Mine Official"})
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row sm:flex-col items-end gap-2 whitespace-nowrap pt-2 sm:pt-0">
                    {canResolve && (
                      <button
                        type="button"
                        onClick={() => setResolveActionModal(act)}
                        className="rounded bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition"
                      >
                        Submit Proof & Resolve
                      </button>
                    )}

                    {canVerify && (
                      <button
                        type="button"
                        onClick={() => setVerifyActionModal(act)}
                        className="rounded bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
                      >
                        Verify & Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve Action Modal */}
      {resolveActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Submit Action Resolution</h3>
                <p className="text-xs text-slate">{resolveActionModal.title}</p>
              </div>
              <button onClick={() => setResolveActionModal(null)} className="text-slate hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate">Rectification & Repair Description *</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the mechanical fix, slope remediation, or replacement implemented..."
                  className="w-full rounded border border-border bg-white p-2 text-xs text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Attach Photographic Proof of Fix</label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-slate hover:bg-slate-200">
                    <span>Choose Images / Proofs</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleResolutionFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadingFiles && <span className="text-primary font-semibold">Uploading proof…</span>}
                </div>

                {resolutionFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {resolutionFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] text-blue-900">
                        {f.name}
                        <button
                          type="button"
                          onClick={() => setResolutionFiles(resolutionFiles.filter((_, idx) => idx !== i))}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setResolveActionModal(null)}
                  className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="rounded bg-primary px-4 py-1.5 font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-60"
                >
                  {resolving ? "Submitting…" : "Mark as Resolved"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Action Modal */}
      {verifyActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Verify & Close Remediation</h3>
                <p className="text-xs text-slate">{verifyActionModal.title}</p>
              </div>
              <button onClick={() => setVerifyActionModal(null)} className="text-slate hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate">Verification Status</label>
                <select
                  value={verificationDecision}
                  onChange={(e) => setVerificationDecision(e.target.value)}
                  className="w-full rounded border border-border bg-white px-2.5 py-1.5 text-ink focus:border-primary focus:outline-none"
                >
                  <option value="closed">Verified & Closed (DGMS Compliant)</option>
                  <option value="in_progress">Reject Rectification (Requires Re-work)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Management Endorsement & Notes</label>
                <textarea
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Enter official sign-off comments, physical verification findings, or rejection grounds..."
                  className="w-full rounded border border-border bg-white p-2 text-xs text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setVerifyActionModal(null)}
                  className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying}
                  className="rounded bg-emerald-700 px-4 py-1.5 font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-60"
                >
                  {verifying ? "Processing…" : "Verify & Close"}
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
            loadActions();
          }}
        />
      )}
    </AppShell>
  );
}
