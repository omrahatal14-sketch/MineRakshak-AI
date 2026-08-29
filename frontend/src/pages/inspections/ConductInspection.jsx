import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import StatusBadge, { SeverityBadge, PriorityBadge } from "../../components/ui/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { inspectionService } from "../../services/inspectionService.js";
import { uploadEvidenceFile } from "../../services/storageService.js";

const CATEGORIES = [
  "Safety",
  "Environmental",
  "Structural",
  "Heavy Machinery & Conveyor",
  "Ventilation & Gas",
  "Haul Road & Transport",
  "Fire Protection",
  "Statutory Documentation",
];

const SEVERITIES = [
  { id: "low", label: "Low", desc: "Minor non-conformance, no immediate risk" },
  { id: "medium", label: "Medium", desc: "Standard statutory infraction" },
  { id: "high", label: "High", desc: "Significant safety or environmental hazard" },
  { id: "critical", label: "Critical", desc: "Imminent danger / stop-work condition" },
];

export default function ConductInspection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [inspection, setInspection] = useState(null);
  const [observations, setObservations] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // New observation modal / inline form state
  const [showObsForm, setShowObsForm] = useState(false);
  const [obsCategory, setObsCategory] = useState(CATEGORIES[0]);
  const [obsSeverity, setObsSeverity] = useState("medium");
  const [obsLocation, setObsLocation] = useState("");
  const [obsDesc, setObsDesc] = useState("");
  const [obsRecs, setObsRecs] = useState("");
  const [obsEvidence, setObsEvidence] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [obsError, setObsError] = useState(null);

  async function loadInspectionData() {
    setLoading(true);
    setError(null);
    try {
      const data = await inspectionService.getInspectionById(id);
      setInspection(data);
      setObservations(data.observations || []);
      setSummary(data.summary || "");
      if (!obsLocation && data.zone) {
        setObsLocation(data.zone);
      }
    } catch (err) {
      setError(err.message || "Failed to load inspection details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInspectionData();
  }, [id]);

  // Evidence file upload handler
  async function handleFileUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFile(true);
    try {
      const uploadPromises = files.map((f) => uploadEvidenceFile(f, `inspections/${id}`));
      const uploadedResults = await Promise.all(uploadPromises);
      setObsEvidence((prev) => [...prev, ...uploadedResults]);
    } catch (err) {
      alert("Error uploading evidence: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  }

  function removeEvidenceItem(index) {
    setObsEvidence((prev) => prev.filter((_, i) => i !== index));
  }

  // Add observation handler
  async function handleAddObservation(e) {
    e.preventDefault();
    if (!obsDesc.trim()) {
      setObsError("Please provide an observation description.");
      return;
    }

    setObsError(null);
    try {
      const newObs = await inspectionService.addObservation(id, {
        category: obsCategory,
        severity: obsSeverity,
        location: obsLocation.trim() || inspection.zone,
        description: obsDesc.trim(),
        recommendations: obsRecs.trim(),
        evidence: obsEvidence,
      });

      setObservations((prev) => [...prev, newObs]);
      // Reset observation form
      setObsDesc("");
      setObsRecs("");
      setObsEvidence([]);
      setObsSeverity("medium");
      setShowObsForm(false);
      setSuccessMsg("Observation recorded successfully.");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setObsError(err.message || "Failed to add observation");
    }
  }

  // Delete observation handler
  async function handleDeleteObservation(obsId) {
    if (!confirm("Are you sure you want to delete this observation?")) return;
    try {
      await inspectionService.deleteObservation(id, obsId);
      setObservations((prev) => prev.filter((o) => o.id !== obsId));
    } catch (err) {
      alert("Failed to delete observation: " + err.message);
    }
  }

  // Save draft
  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    try {
      await inspectionService.updateInspection(id, {
        summary: summary.trim(),
        status: "in_progress",
      });
      setSuccessMsg("Draft progress saved successfully.");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      setError(err.message || "Failed to save draft.");
    } finally {
      setSaving(false);
    }
  }

  // Submit inspection
  async function handleSubmitInspection() {
    if (observations.length === 0) {
      if (!confirm("No observations have been recorded for this inspection yet. Submit anyway?")) {
        return;
      }
    }

    setSubmitting(true);
    setError(null);
    try {
      await inspectionService.submitInspection(id, {
        summary: summary.trim(),
      });
      navigate(`/inspections/${id}`, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to submit inspection.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Conduct Field Inspection">
        <div className="card flex h-60 items-center justify-center text-xs text-slate">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Loading inspection workspace…
          </div>
        </div>
      </AppShell>
    );
  }

  if (error && !inspection) {
    return (
      <AppShell title="Conduct Field Inspection">
        <div className="card text-xs text-status-overdue">
          <p className="font-semibold">{error}</p>
          <Link to="/inspections" className="mt-3 inline-block text-primary hover:underline">
            ← Back to Inspections
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Field Inspection Workspace">
      {/* Top Banner & Info */}
      <div className="mb-6 rounded-lg border border-border bg-surface p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/inspections" className="text-xs text-slate hover:text-ink">
                ← Inspections
              </Link>
              <span className="text-slate">/</span>
              <span className="font-mono text-xs text-slate">{id}</span>
            </div>
            <h1 className="mt-1 text-lg font-bold text-ink">{inspection.title}</h1>
            <p className="text-xs text-slate">
              <strong className="text-ink">{inspection.mineName}</strong> • {inspection.zone} • Scheduled:{" "}
              <span className="font-mono">{inspection.scheduledDate}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <PriorityBadge priority={inspection.priority} />
            <StatusBadge status={inspection.status} />
          </div>
        </div>

        {/* General Summary / Notes */}
        <div className="mt-4 pt-4 border-t border-border">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate">
            General Field Remarks & Assessment
          </label>
          <textarea
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Document weather conditions, operational state of the pit, inspector notes..."
            className="w-full rounded border border-border bg-white p-3 text-xs text-ink placeholder:text-slate/40 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 rounded bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
          ✓ {successMsg}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-xs text-status-overdue border border-red-200">
          {error}
        </div>
      )}

      {/* Observations Section */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">
              Recorded Observations ({observations.length})
            </h2>
            <p className="text-xs text-slate">
              Record all non-conformances, mechanical defects, or safety observations found on-site.
            </p>
          </div>

          {!showObsForm && (
            <button
              type="button"
              onClick={() => setShowObsForm(true)}
              className="inline-flex items-center gap-1.5 rounded bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
            >
              + Add Observation
            </button>
          )}
        </div>

        {/* Add Observation Form Modal/Panel */}
        {showObsForm && (
          <div className="rounded-lg border-2 border-primary/40 bg-white p-5 shadow-md transition">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-ink">Add New Inspection Observation</h3>
              <button
                type="button"
                onClick={() => setShowObsForm(false)}
                className="text-slate hover:text-ink text-xs"
              >
                ✕ Cancel
              </button>
            </div>

            {obsError && (
              <div className="mt-3 rounded bg-red-50 p-2 text-xs text-status-overdue">
                {obsError}
              </div>
            )}

            <form onSubmit={handleAddObservation} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block font-semibold text-slate">Observation Category *</label>
                  <select
                    value={obsCategory}
                    onChange={(e) => setObsCategory(e.target.value)}
                    className="w-full rounded border border-border bg-white px-3 py-2 text-ink focus:border-primary focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate">Specific Location / Sub-Zone</label>
                  <input
                    type="text"
                    value={obsLocation}
                    onChange={(e) => setObsLocation(e.target.value)}
                    placeholder="e.g. Conveyor 4B Head Pulley Guard"
                    className="w-full rounded border border-border bg-white px-3 py-2 text-ink focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Severity Selector */}
              <div>
                <label className="mb-1.5 block font-semibold text-slate">Severity Level *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setObsSeverity(s.id)}
                      className={`flex flex-col items-start rounded border p-2.5 text-left transition ${
                        obsSeverity === s.id
                          ? s.id === "critical"
                            ? "border-red-600 bg-red-50 text-red-900 ring-2 ring-red-400"
                            : s.id === "high"
                            ? "border-orange-600 bg-orange-50 text-orange-900 ring-2 ring-orange-400"
                            : s.id === "medium"
                            ? "border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-400"
                            : "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400"
                          : "border-border bg-canvas hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-bold text-xs capitalize">{s.label}</span>
                      <span className="mt-0.5 text-[10px] text-slate line-clamp-1">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={obsDesc}
                  onChange={(e) => setObsDesc(e.target.value)}
                  placeholder="Describe the exact safety hazard, physical damage, missing guard, or operational defect observed..."
                  className="w-full rounded border border-border bg-white p-2.5 text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Inspector Recommendations</label>
                <textarea
                  rows={2}
                  value={obsRecs}
                  onChange={(e) => setObsRecs(e.target.value)}
                  placeholder="Immediate remediation recommended (e.g. install emergency pull cord, replace worn roller)..."
                  className="w-full rounded border border-border bg-white p-2.5 text-ink focus:border-primary focus:outline-none"
                />
              </div>

              {/* Evidence Upload */}
              <div>
                <label className="mb-1 block font-semibold text-slate">
                  Evidence Photos & Documents (Firebase Storage)
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-border bg-canvas px-3.5 py-2 text-xs font-semibold text-slate hover:bg-slate-200/70 transition">
                    <span>Upload Files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadingFile && (
                    <span className="text-[11px] text-slate animate-pulse">
                      Uploading to Storage…
                    </span>
                  )}
                </div>

                {obsEvidence.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {obsEvidence.map((ev, idx) => (
                      <div
                        key={idx}
                        className="group relative flex items-center gap-2 rounded border border-border bg-canvas p-2 text-xs"
                      >
                        {ev.type?.startsWith("image/") ? (
                          <img
                            src={ev.url}
                            alt={ev.name}
                            className="h-10 w-10 rounded object-cover border border-border"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-200 text-slate font-mono text-[10px]">
                            DOC
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-ink text-[11px]">{ev.name}</p>
                          <p className="text-[10px] text-slate">
                            {ev.size ? `${(ev.size / 1024).toFixed(1)} KB` : "Attached"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEvidenceItem(idx)}
                          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white shadow-xs hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowObsForm(false)}
                  className="rounded border border-border px-3 py-1.5 text-slate hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-1.5 font-semibold text-white hover:bg-primary-dark"
                >
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Observations List */}
        {observations.length === 0 && !showObsForm ? (
          <div className="card flex flex-col items-center justify-center py-8 text-center">
            <p className="text-xs text-slate">No observations added yet for this inspection.</p>
            <button
              type="button"
              onClick={() => setShowObsForm(true)}
              className="mt-3 rounded border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-canvas"
            >
              + Add First Observation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {observations.map((obs, idx) => (
              <div key={obs.id || idx} className="card relative transition hover:border-slate-300">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-xs text-ink">{obs.category}</span>
                    <span className="text-xs text-slate">• {obs.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={obs.severity} />
                    <button
                      type="button"
                      onClick={() => handleDeleteObservation(obs.id)}
                      className="rounded p-1 text-slate hover:text-red-600 hover:bg-red-50 text-xs"
                      title="Delete observation"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-xs text-ink leading-relaxed whitespace-pre-wrap">
                  {obs.description}
                </p>

                {obs.recommendations && (
                  <div className="mt-2.5 rounded bg-blue-50/70 p-2 text-xs text-blue-900 border border-blue-100">
                    <strong>Recommendation:</strong> {obs.recommendations}
                  </div>
                )}

                {/* Evidence Thumbnails */}
                {obs.evidence && obs.evidence.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/60">
                    <span className="text-[10px] font-semibold text-slate uppercase">Evidence:</span>
                    {obs.evidence.map((ev, i) => (
                      <a
                        key={i}
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded border border-border bg-canvas px-2 py-1 text-[11px] text-primary hover:underline"
                      >
                        {ev.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed / Sticky Bottom Submission Action Bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-lg border border-border bg-surface p-4 shadow-lg">
        <div className="text-xs text-slate">
          Recorded: <strong className="text-ink">{observations.length} Observations</strong>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || submitting}
            className="rounded border border-border bg-white px-4 py-2 text-xs font-semibold text-slate hover:bg-canvas hover:text-ink disabled:opacity-60 transition"
          >
            {saving ? "Saving…" : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={handleSubmitInspection}
            disabled={saving || submitting}
            className="rounded bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-dark focus:ring-2 focus:ring-primary disabled:opacity-60 transition"
          >
            {submitting ? "Submitting…" : "Submit Inspection"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}
