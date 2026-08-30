"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { correctiveActionService } from "../../services/correctiveActionService.js";
import { inspectionService } from "../../services/inspectionService.js";

const CATEGORIES = [
  "Safety",
  "Environmental",
  "Structural",
  "Heavy Machinery & Conveyor",
  "Ventilation & Gas",
  "Haul Road & Transport",
  "Statutory Compliance",
];

export default function CreateActionModal({ onClose, onCreated, initialData = {} }) {
  const { profile } = useAuth();
  const [mines, setMines] = useState([]);
  const [inspectors, setInspectors] = useState([]);

  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [category, setCategory] = useState(initialData.category || CATEGORIES[0]);
  const [mineId, setMineId] = useState(initialData.mineId || profile?.mineId || "KCM-01");
  const [zone, setZone] = useState(initialData.zone || "");
  const [assignedTo, setAssignedTo] = useState("");
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [priority, setPriority] = useState(initialData.priority || "high");
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

        if (inspectorsData && inspectorsData.length > 0) {
          setAssignedTo(inspectorsData[0].uid);
        } else if (profile?.uid) {
          setAssignedTo(profile.uid);
        }
      } catch (err) {
        console.warn("Failed to load options:", err);
      }
    }
    loadOptions();
  }, [profile]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }
    if (!assignedTo) {
      setError("Please assign a responsible officer.");
      return;
    }

    const selectedMine = mines.find((m) => m.id === mineId);
    const selectedInspector = inspectors.find((i) => i.uid === assignedTo);

    setSubmitting(true);
    setError(null);
    try {
      const newAction = await correctiveActionService.createAction({
        title: title.trim(),
        description: description.trim(),
        category,
        mineId,
        mineName: selectedMine ? selectedMine.name : mineId,
        zone: zone.trim() || "Operational Sector",
        priority,
        targetDate,
        assignedTo,
        assignedToName: selectedInspector ? (selectedInspector.name || selectedInspector.email) : "Field Officer",
        observationId: initialData.observationId || null,
        inspectionId: initialData.inspectionId || null,
      });
      onCreated(newAction);
    } catch (err) {
      setError(err.message || "Failed to create corrective action.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-ink">Create Corrective Action</h2>
            <p className="text-xs text-slate">Assign mandatory hazard remediation with deadlines & priority.</p>
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
            <label className="mb-1 block font-semibold text-slate">Action Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Replace Conveyor 4B Mechanical Mesh Guard"
              className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate">Remediation Description & Instructions *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the mandatory technical rectification, safety lockout procedures, and verification criteria..."
              className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Mine Facility</label>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Assign Responsible User *</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                {inspectors.map((ins) => (
                  <option key={ins.uid} value={ins.uid}>
                    {ins.name || ins.email} ({ins.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Target Completion Date *</label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                <option value="low">Low (14-30 Days)</option>
                <option value="medium">Medium (7-14 Days)</option>
                <option value="high">High (48-72 Hours)</option>
                <option value="critical">Critical (Immediate / 24 Hours)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Zone / Location</label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. Pit A - Transfer 3"
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
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
              {submitting ? "Assigning…" : "Create Action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
