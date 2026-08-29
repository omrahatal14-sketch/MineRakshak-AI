import { useState } from "react";
import { adminService } from "../../services/adminService.js";

export default function MineModal({ mine, onClose, onSaved }) {
  const isEdit = Boolean(mine);
  const [name, setName] = useState(mine?.name || "");
  const [code, setCode] = useState(mine?.code || "");
  const [zone, setZone] = useState(mine?.zone || "Chhattisgarh");
  const [latitude, setLatitude] = useState(mine?.latitude || "22.3");
  const [longitude, setLongitude] = useState(mine?.longitude || "82.6");
  const [status, setStatus] = useState(mine?.status || "active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Mine name and unique code are required.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await adminService.updateMine(mine.id, {
          name: name.trim(),
          zone: zone.trim(),
          latitude,
          longitude,
          status,
        });
      } else {
        await adminService.createMine({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          zone: zone.trim(),
          latitude,
          longitude,
          status,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save mine facility.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-ink">
            {isEdit ? "Edit Mine Facility" : "Register New Coal Mine"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-slate hover:bg-canvas">
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
            <label className="mb-1 block font-semibold text-slate">Mine Facility Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kusmunda Coal Mine"
              className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Mine Code (ID) *</label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. KCM-01"
                className="w-full rounded border border-border px-3 py-2 text-ink uppercase font-mono focus:border-primary focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Zone / State *</label>
              <input
                type="text"
                required
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. Chhattisgarh"
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate">Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate">Operating Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
            >
              <option value="active">Active Extraction</option>
              <option value="maintenance">Maintenance / Care</option>
              <option value="closed">Decommissioned</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-primary px-4 py-1.5 font-bold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Update Mine" : "Register Mine"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
