"use client";

import { useState, useEffect } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { complianceService } from "../../src/services/moduleServices.js";
import { inspectionService } from "../../src/services/inspectionService.js";
import StatusBadge from "../../src/components/ui/StatusBadge.jsx";
import {
  ClipboardCheck, Plus, Filter, Calendar, AlertTriangle,
  CheckCircle2, Clock, FileText, Check
} from "lucide-react";

export default function CompliancePage() {
  const { profile } = useAuth();
  const [requirements, setRequirements] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mineFilter, setMineFilter] = useState("all");

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Safety");
  const [dueDate, setDueDate] = useState("");
  const [selectedMine, setSelectedMine] = useState("KCM-01");
  const [isRecurring, setIsRecurring] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [reqData, mData] = await Promise.all([
        complianceService.getRequirements({
          category: categoryFilter !== "all" ? categoryFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
          mine: mineFilter !== "all" ? mineFilter : undefined,
        }).catch(() => []),
        inspectionService.getMines().catch(() => []),
      ]);
      setRequirements(reqData || []);
      setMines(mData || []);
    } catch (err) {
      console.error("Failed to load compliance data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [categoryFilter, statusFilter, mineFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const mineObj = mines.find((m) => m.id === selectedMine);
      await complianceService.createRequirement({
        title: title.trim(),
        description: description.trim(),
        category,
        dueDate,
        isRecurring,
        mineId: selectedMine,
        mineName: mineObj ? mineObj.name : selectedMine,
      });
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      loadData();
    } catch (err) {
      alert("Failed to create compliance requirement: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const overdueCount = requirements.filter((r) => r.status === "overdue").length;
  const pendingCount = requirements.filter((r) => r.status === "pending").length;
  const completedCount = requirements.filter((r) => r.status === "completed").length;

  return (
    <AppShell title="Statutory Compliance & Regulatory Registry">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate uppercase tracking-wider">Overdue Mandates</span>
            <p className="mt-1 text-2xl font-bold text-red-600">{loading ? "—" : overdueCount}</p>
            <p className="text-[11px] text-red-700 font-semibold mt-0.5">Immediate DGMS attention needed</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate uppercase tracking-wider">Upcoming Mandates</span>
            <p className="mt-1 text-2xl font-bold text-amber-600">{loading ? "—" : pendingCount}</p>
            <p className="text-[11px] text-amber-700 font-semibold mt-0.5">Scheduled within 30 days</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate uppercase tracking-wider">Completed Mandates</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{loading ? "—" : completedCount}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Verified & audited</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Trigger Bar */}
      <div className="card mb-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Safety">Safety (DGMS CMR 2017)</option>
                <option value="Environmental">Environmental (CPCB)</option>
                <option value="Equipment">Equipment & HEMM</option>
                <option value="Structural">Structural & Geotech</option>
                <option value="Documentation">Documentation & Labour</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="overdue">Overdue</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
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

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Compliance Mandate</span>
          </button>
        </div>
      </div>

      {/* Compliance Mandates Table */}
      {loading ? (
        <div className="card text-center py-16 text-xs text-slate">Loading compliance requirements…</div>
      ) : requirements.length === 0 ? (
        <div className="card text-center py-16 text-xs text-slate">No compliance requirements found.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
          <table className="min-w-full divide-y divide-border text-left text-xs">
            <thead className="bg-canvas font-semibold text-slate uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Statutory Requirement</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Cycle</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {requirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-ink">{req.title}</div>
                    <div className="text-[11px] text-slate line-clamp-1">{req.description}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded bg-canvas border border-border px-2 py-0.5 text-xs font-medium text-ink">
                      {req.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-ink">
                    {req.mineName || req.mineId}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs">
                    <span className={req.status === "overdue" ? "text-red-600 font-bold" : "text-slate"}>
                      {req.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate text-[11px]">
                    {req.isRecurring ? "Recurring Periodic" : "One-Time"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <StatusBadge status={req.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Compliance Requirement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-ink">Add Statutory Compliance Mandate</h3>
                <p className="text-xs text-slate">Register a DGMS or CPCB statutory requirement with deadline.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate">Requirement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quarterly Underground Ventilation Quantity Audit"
                  className="w-full rounded border border-border px-3 py-2 text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate">Statutory Description & Guidelines *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Specify applicable DGMS regulation, minimum airflow parameters, and sampling points..."
                  className="w-full rounded border border-border p-2 text-xs text-ink focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-border px-2.5 py-2 text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="Safety">Safety (DGMS)</option>
                    <option value="Environmental">Environmental (CPCB)</option>
                    <option value="Equipment">Equipment & Machinery</option>
                    <option value="Structural">Structural & Geotech</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate">Mine Facility</label>
                  <select
                    value={selectedMine}
                    onChange={(e) => setSelectedMine(e.target.value)}
                    className="w-full rounded border border-border px-2.5 py-2 text-ink focus:border-primary focus:outline-none"
                  >
                    {mines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-slate">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded border border-border px-2.5 py-2 text-ink focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="recurring" className="font-semibold text-slate text-xs cursor-pointer">
                    Recurring Statutory Cycle
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded border border-border px-3.5 py-1.5 text-slate hover:bg-canvas"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-primary px-4 py-2 font-bold text-white shadow-xs hover:bg-primary-dark disabled:opacity-60 transition"
                >
                  {submitting ? "Saving…" : "Save Mandate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
