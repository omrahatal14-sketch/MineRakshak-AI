import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import StatusBadge, { SeverityBadge, PriorityBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { inspectionService } from "../../services/inspectionService.js";

export default function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mine Official review form state
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await inspectionService.getInspectionById(id);
      setInspection(data);
      if (data.reviewNotes) {
        setReviewNotes(data.reviewNotes);
      }
    } catch (err) {
      setError(err.message || "Failed to load inspection");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function handleReviewSubmit(decision = "reviewed") {
    setReviewing(true);
    setError(null);
    try {
      await inspectionService.reviewInspection(id, {
        reviewNotes: reviewNotes.trim() || "Inspection findings reviewed and acknowledged by Mine Management.",
        decision,
      });
      setReviewSuccess(
        decision === "needs_revision"
          ? "Inspection marked for revision by the field officer."
          : "Inspection successfully approved and marked as Reviewed."
      );
      loadData();
    } catch (err) {
      setError(err.message || "Failed to record review.");
    } finally {
      setReviewing(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Inspection Details">
        <div className="card flex h-60 items-center justify-center text-xs text-slate">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Loading inspection details…
          </div>
        </div>
      </AppShell>
    );
  }

  if (error && !inspection) {
    return (
      <AppShell title="Inspection Details">
        <div className="card text-xs text-status-overdue">
          <p className="font-semibold">{error}</p>
          <Link to="/inspections" className="mt-3 inline-block text-primary hover:underline">
            ← Back to Inspections
          </Link>
        </div>
      </AppShell>
    );
  }

  const isFieldOfficer = profile?.role === "field_officer";
  const canConduct =
    isFieldOfficer &&
    inspection.inspectorId === profile?.uid &&
    ["assigned", "in_progress"].includes(inspection.status);

  const canReview =
    ["mine_official", "corporate", "admin"].includes(profile?.role) &&
    inspection.status === "submitted";

  const observations = inspection.observations || [];

  return (
    <AppShell title="Inspection Overview">
      {/* Top Header Card */}
      <div className="mb-6 rounded-lg border border-border bg-surface p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <Link to="/inspections" className="text-slate hover:text-ink">
                ← All Inspections
              </Link>
              <span className="text-slate">/</span>
              <span className="font-mono text-slate">{inspection.id}</span>
            </div>
            <h1 className="mt-2 text-xl font-bold text-ink">{inspection.title}</h1>
            <p className="mt-1 text-xs text-slate">
              <span className="font-semibold text-ink">{inspection.mineName}</span> • {inspection.zone}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <PriorityBadge priority={inspection.priority} />
            <StatusBadge status={inspection.status} />
            {canConduct && (
              <Link
                to={`/inspections/${inspection.id}/conduct`}
                className="rounded bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
              >
                Conduct / Edit
              </Link>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border pt-4 text-xs">
          <div>
            <span className="block font-medium text-slate uppercase text-[10px] tracking-wider">Inspection Type</span>
            <span className="mt-1 block font-semibold text-ink">{inspection.type || "Safety Audit"}</span>
          </div>
          <div>
            <span className="block font-medium text-slate uppercase text-[10px] tracking-wider">Assigned Inspector</span>
            <span className="mt-1 block font-semibold text-ink">{inspection.inspectorName || "Field Officer"}</span>
          </div>
          <div>
            <span className="block font-medium text-slate uppercase text-[10px] tracking-wider">Scheduled Date</span>
            <span className="mt-1 block font-mono text-ink">{inspection.scheduledDate || "—"}</span>
          </div>
          <div>
            <span className="block font-medium text-slate uppercase text-[10px] tracking-wider">Submitted Date</span>
            <span className="mt-1 block font-mono text-ink">
              {inspection.submittedAt
                ? new Date(inspection.submittedAt._seconds ? inspection.submittedAt._seconds * 1000 : inspection.submittedAt).toLocaleDateString()
                : "Not Submitted"}
            </span>
          </div>
        </div>

        {/* General Summary */}
        {inspection.summary && (
          <div className="mt-4 rounded bg-canvas p-3.5 text-xs text-ink border border-border/70">
            <span className="block font-bold text-slate uppercase text-[10px] tracking-wider mb-1">
              Field Inspector Remarks
            </span>
            <p className="whitespace-pre-wrap">{inspection.summary}</p>
          </div>
        )}
      </div>

      {reviewSuccess && (
        <div className="mb-4 rounded bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
          ✓ {reviewSuccess}
        </div>
      )}

      {/* Mine Official Review Action Box */}
      {canReview && (
        <div className="mb-6 rounded-lg border-2 border-amber-400 bg-amber-50/40 p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-ink">Mine Official Review Required</h2>
          </div>
          <p className="mt-1 text-xs text-slate">
            Review the {observations.length} observations and evidence submitted by {inspection.inspectorName}. Record your review remarks to finalize this statutory inspection.
          </p>

          <div className="mt-3.5 space-y-3">
            <textarea
              rows={2}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Enter official review feedback, corrective instructions, or compliance endorsement..."
              className="w-full rounded border border-border bg-white p-2.5 text-xs text-ink placeholder:text-slate/40 focus:border-primary focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleReviewSubmit("needs_revision")}
                disabled={reviewing}
                className="rounded border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-slate hover:bg-slate-100 disabled:opacity-60 transition"
              >
                Request Revision
              </button>
              <button
                type="button"
                onClick={() => handleReviewSubmit("reviewed")}
                disabled={reviewing}
                className="rounded bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-60 transition"
              >
                {reviewing ? "Processing…" : "Mark as Reviewed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* If Already Reviewed */}
      {inspection.status === "reviewed" && inspection.reviewNotes && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-900 uppercase tracking-wide text-[11px]">
              Reviewed by Mine Management
            </span>
            <span className="font-mono text-[10px] text-emerald-700">
              {inspection.reviewedByName || "Mine Official"}
            </span>
          </div>
          <p className="mt-1 text-emerald-950 whitespace-pre-wrap">{inspection.reviewNotes}</p>
        </div>
      )}

      {/* Observations Section */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">Recorded Observations ({observations.length})</h2>
        </div>

        {observations.length === 0 ? (
          <div className="card text-center py-6 text-xs text-slate">
            No observations recorded for this inspection yet.
          </div>
        ) : (
          observations.map((obs, idx) => (
            <div key={obs.id || idx} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-xs text-ink">{obs.category}</span>
                  <span className="text-xs text-slate">• {obs.location}</span>
                </div>
                <SeverityBadge severity={obs.severity} />
              </div>

              <p className="mt-2.5 text-xs text-ink leading-relaxed whitespace-pre-wrap">
                {obs.description}
              </p>

              {obs.recommendations && (
                <div className="mt-2.5 rounded bg-blue-50/80 p-2.5 text-xs text-blue-900 border border-blue-100">
                  <span className="font-semibold">Recommended Remediation:</span> {obs.recommendations}
                </div>
              )}

              {/* Evidence Gallery */}
              {obs.evidence && obs.evidence.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-border">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate mb-2">
                    Evidence Attachments ({obs.evidence.length})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {obs.evidence.map((ev, evIdx) => (
                      <a
                        key={evIdx}
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex flex-col rounded border border-border bg-canvas overflow-hidden hover:border-primary transition"
                      >
                        {ev.type?.startsWith("image/") ? (
                          <img
                            src={ev.url}
                            alt={ev.name}
                            className="h-24 w-full object-cover group-hover:opacity-90 transition"
                          />
                        ) : (
                          <div className="flex h-24 w-full items-center justify-center bg-slate-100 text-slate font-mono text-xs">
                            DOCUMENT
                          </div>
                        )}
                        <div className="p-1.5 text-center">
                          <p className="truncate font-medium text-ink text-[11px] group-hover:text-primary">
                            {ev.name}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
