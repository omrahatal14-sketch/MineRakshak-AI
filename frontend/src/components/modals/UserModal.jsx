"use client";

import { useState, useEffect } from "react";
import { adminService } from "../../services/adminService.js";

const ROLES = [
  { id: "field_officer", label: "Field Officer (Inspector)" },
  { id: "mine_official", label: "Mine Official (Compliance Manager)" },
  { id: "contractor", label: "Contractor Company (Repair Vendor)" },
  { id: "worker", label: "Worker / Miner (Operations)" },
  { id: "corporate", label: "Corporate Management" },
  { id: "admin", label: "System Administrator" },
];

export default function UserModal({ user, onClose, onSaved }) {
  const isEdit = Boolean(user);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [role, setRole] = useState(user?.role || "field_officer");
  const [mineId, setMineId] = useState(user?.mineId || "");
  const [status, setStatus] = useState(user?.status || "active");
  const [password, setPassword] = useState("MineRakshak@123");
  const [mines, setMines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMines() {
      try {
        const data = await adminService.getMines();
        setMines(data || []);
        if (!user?.mineId && data?.length > 0 && ["field_officer", "mine_official", "contractor", "worker"].includes(role)) {
          setMineId(data[0].id);
        }
      } catch {}
    }
    loadMines();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and Email are required.");
      return;
    }

    const selectedMine = mines.find((m) => m.id === mineId);
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await adminService.updateUser(user.uid, {
          name: name.trim(),
          role,
          mineId: ["corporate", "admin"].includes(role) ? null : mineId,
          mineName: selectedMine ? selectedMine.name : null,
          status,
        });
      } else {
        await adminService.createUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          mineId: ["corporate", "admin"].includes(role) ? null : mineId,
          mineName: selectedMine ? selectedMine.name : null,
        });
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Failed to save user account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-bold text-ink">
            {isEdit ? "Edit User Account" : "Create New User Account"}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-slate">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-slate">Email Address *</label>
            <input
              type="email"
              required
              disabled={isEdit}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. inspector@minerakshak.demo"
              className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none disabled:bg-slate-100"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="mb-1 block font-semibold text-slate">Default Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none font-mono"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-semibold text-slate">Platform Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {["field_officer", "mine_official", "contractor"].includes(role) && (
              <div>
                <label className="mb-1 block font-semibold text-slate">Assigned Mine</label>
                <select
                  value={mineId}
                  onChange={(e) => setMineId(e.target.value)}
                  className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
                >
                  {mines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {isEdit && (
            <div>
              <label className="mb-1 block font-semibold text-slate">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive / Deactivated</option>
              </select>
            </div>
          )}

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
              {saving ? "Saving…" : isEdit ? "Update User" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
