"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { inspectionService } from "../../services/inspectionService.js";

const INSPECTION_TYPES = [
  "Comprehensive Safety Audit",
  "Environmental & Dust Compliance",
  "Slope Stability & Bench Inspection",
  "Heavy Earth Moving Machinery (HEMM)",
  "Ventilation & Gas Monitoring",
  "Electrical & Substation Safety",
  "Haul Road & Transport Assessment",
  "Statutory Document & Register Review",
];

export default function CreateInspectionModal({ onClose, onCreated }) {
  const { profile } = useAuth();
  const [mines, setMines] = useState([]);
  const [inspectors, setInspectors] = useState([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState(INSPECTION_TYPES[0]);
  const [mineId, setMineId] = useState(profile?.mineId || "");
  const [zone, setZone] = useState("Main Pit Sector 1");
  const [inspectorId, setInspectorId] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [priority, setPriority] = useState("medium");
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

        if (!mineId && minesData && minesData.length > 0) {
          setMineId(minesData[0].id);
        }
        if (inspectorsData && inspectorsData.length > 0) {
          setInspectorId(inspectorsData[0].uid);
        }
      } catch (err) {
        console.warn("Failed to load options:", err);
      }
    }
    loadOptions();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide an inspection title.");
      return;
    }
    if (!mineId) {
      setError("Please select a mine facility.");
      return;
    }
    if (!inspectorId) {
      setError("Please assign a Field Officer inspector.");
      return;
    }

    const selectedMine = mines.find((m) => m.id === mineId);
    const selectedInspector = inspectors.find((i) => i.uid === inspectorId);

    setSubmitting(true);
    setError(null);
    try {
      const newInspection = await inspectionService.createInspection({
        title: title.trim(),
        type,
        mineId,
        mineName: selectedMine ? selectedMine.name : mineId,
        zone: zone.trim() || "Main Pit",
        inspectorId,
        inspectorName: selectedInspector ? (selectedInspector.name || selectedInspector.email) : "Field Officer",
        scheduledDate,
        priority,
      });

      onCreated(newInspection);
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
            <h2 className="text-base font-bold text-ink">Schedule Statutory Inspection</h2>
            <p className="text-xs text-slate">Assign a safety audit to a field officer with designated parameters.</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded bg-red-50 p-2.5 text-xs text-status-overdue border border-red-200">
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
              placeholder="e.g. Monthly Haul Road & Dust Suppression Audit"
              className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Audit Type</label>
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
              <label className="mb-1 block font-semibold text-slate">Target Coal Mine</label>
              <select
                value={mineId}
                onChange={(e) => setMineId(e.target.value)}
                disabled={Boolean(profile?.mineId && profile.role === "mine_official")}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none disabled:bg-slate-100"
              >
                {mines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.zone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Specific Pit / Sub-Zone</label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. Pit 2 West Bench"
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Assigned Field Officer *</label>
              <select
                value={inspectorId}
                onChange={(e) => setInspectorId(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                {inspectors.map((ins) => (
                  <option key={ins.uid} value={ins.uid}>
                    {ins.name || ins.email} ({ins.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Scheduled Audit Date</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical / Statutory Notice</option>
              </select>
            </div>
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
              {submitting ? "Scheduling…" : "Schedule Inspection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
