import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { inspectionService } from "../../services/inspectionService.js";

const INSPECTION_TYPES = [
  "Routine Safety Audit",
  "Structural & Geotechnical Inspection",
  "Environmental & Effluent Compliance",
  "Heavy Machinery & Conveyor Safety",
  "Ventilation & Gas Monitoring",
  "Statutory DGMS Compliance Review",
  "Emergency Hazard Inspection",
];

export default function CreateInspectionModal({ onClose, onCreated }) {
  const { profile } = useAuth();
  const [mines, setMines] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [title, setTitle] = useState("");
  const [type, setType] = useState(INSPECTION_TYPES[0]);
  const [mineId, setMineId] = useState(profile?.mineId || "KCM-01");
  const [zone, setZone] = useState("");
  const [inspectorId, setInspectorId] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [priority, setPriority] = useState("high");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [minesData, inspectorsData] = await Promise.all([
          inspectionService.getMines().catch(() => []),
          inspectionService.getInspectors().catch(() => []),
        ]);
        setMines(minesData || []);
        setInspectors(inspectorsData || []);

        if (minesData && minesData.length > 0 && !profile?.mineId) {
          setMineId(minesData[0].id);
        }
        if (inspectorsData && inspectorsData.length > 0) {
          setInspectorId(inspectorsData[0].uid);
        } else if (profile?.uid) {
          setInspectorId(profile.uid);
        }
      } catch (err) {
        console.warn("Failed to load options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Inspection title is required.");
      return;
    }
    if (!inspectorId) {
      setError("Please assign a Field Officer.");
      return;
    }

    const selectedMine = mines.find((m) => m.id === mineId);
    const selectedInspector = inspectors.find((i) => i.uid === inspectorId);

    setSubmitting(true);
    setError(null);
    try {
      const newInsp = await inspectionService.createInspection({
        title: title.trim(),
        type,
        mineId,
        mineName: selectedMine ? selectedMine.name : mineId,
        zone: zone.trim() || "Main Excavation Sector",
        inspectorId,
        inspectorName: selectedInspector ? (selectedInspector.name || selectedInspector.email) : "Field Officer",
        scheduledDate,
        priority,
        summary: summary.trim(),
      });
      onCreated(newInsp);
    } catch (err) {
      setError(err.message || "Failed to schedule inspection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-ink">Schedule / Assign Inspection</h2>
            <p className="text-xs text-slate">Assign a statutory field inspection to a field officer.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate hover:bg-canvas hover:text-ink"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded bg-red-50 p-2.5 text-xs text-status-overdue">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate">Inspection Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Conveyor 4B Mechanical Safety & Guarding Audit"
              className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Mine Facility *</label>
              <select
                value={mineId}
                onChange={(e) => setMineId(e.target.value)}
                disabled={Boolean(profile?.mineId && profile.role === "mine_official")}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                {mines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Specific Zone / Location</label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. Pit A - Transfer Tower 3"
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Inspection Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                {INSPECTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Assign Field Officer *</label>
              <select
                value={inspectorId}
                onChange={(e) => setInspectorId(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                {inspectors.length > 0 ? (
                  inspectors.map((ins) => (
                    <option key={ins.uid} value={ins.uid}>
                      {ins.name || ins.email} ({ins.email})
                    </option>
                  ))
                ) : (
                  <option value={profile?.uid || "current"}>
                    {profile?.name || "Current User"} (Assigned Field Officer)
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Scheduled Date</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                <option value="low">Low (Routine Monitoring)</option>
                <option value="medium">Medium (Standard Periodic)</option>
                <option value="high">High (Priority Compliance)</option>
                <option value="critical">Critical (Immediate Attention)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate">Instructions / Scope Summary</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Outline specific machinery, safety checklists, or areas the officer should focus on..."
              className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-border px-3.5 py-1.5 font-medium text-slate hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-primary px-4 py-1.5 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {submitting ? "Assigning…" : "Assign Inspection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
