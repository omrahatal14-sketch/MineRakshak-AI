"use client";

import { useState, useEffect } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { inspectionService } from "../../src/services/inspectionService.js";
import StatusBadge, { PriorityBadge, SeverityBadge } from "../../src/components/ui/StatusBadge.jsx";
import CreateInspectionModal from "../../src/components/modals/CreateInspectionModal.jsx";
import {
  ClipboardCheck, Search, Filter, Calendar, MapPin, Plus,
  FileText, CheckCircle2, ChevronRight, AlertTriangle
} from "lucide-react";

export default function InspectionsPage() {
  const { profile } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [mines, setMines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [mineFilter, setMineFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [iData, mData] = await Promise.all([
        inspectionService.getInspections({
          status: statusFilter,
          mine: mineFilter,
          search: searchQuery,
        }).catch(() => []),
        inspectionService.getMines().catch(() => []),
      ]);
      setInspections(iData || []);
      setMines(mData || []);
    } catch (err) {
      console.error("Failed to load inspections:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter, mineFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  return (
    <AppShell title="Statutory Inspections & Safety Audits">
      {/* Filters Bar & Actions */}
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
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed / Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate">Mine:</span>
              <select
                value={mineFilter}
                onChange={(e) => setMineFilter(e.target.value)}
                className="rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none max-w-[180px] truncate"
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

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit title, zone..."
                className="w-48 sm:w-60 rounded border border-border bg-white px-3 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
              >
                Search
              </button>
            </form>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-dark transition whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inspections Table */}
      {loading ? (
        <div className="card text-center py-16 text-xs text-slate">Loading statutory inspections…</div>
      ) : inspections.length === 0 ? (
        <div className="card text-center py-16 text-xs text-slate">No inspections found matching your filters.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
          <table className="min-w-full divide-y divide-border text-left text-xs">
            <thead className="bg-canvas font-semibold text-slate uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Inspection Title & Type</th>
                <th className="px-4 py-3">Facility & Zone</th>
                <th className="px-4 py-3">Inspector</th>
                <th className="px-4 py-3">Scheduled Date</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {inspections.map((ins) => (
                <tr key={ins.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-ink">{ins.title}</div>
                    <div className="text-[11px] text-slate font-mono">{ins.type || "Statutory DGMS Inspection"}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-ink">{ins.mineName || ins.mineId}</div>
                    <div className="text-[11px] text-slate">{ins.zone || "Operational Pit"}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate">
                    {ins.inspectorName || "Field Officer"}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate text-[11px]">
                    {ins.scheduledDate}
                  </td>
                  <td className="px-4 py-3.5">
                    <PriorityBadge priority={ins.priority} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={ins.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => setSelectedInspection(ins)}
                      className="rounded border border-border px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-light hover:border-primary/40 transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-surface p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={selectedInspection.priority} />
                  <span className="font-mono text-[10px] font-bold text-slate uppercase">{selectedInspection.id}</span>
                </div>
                <h3 className="text-base font-bold text-ink mt-0.5">{selectedInspection.title}</h3>
              </div>
              <button onClick={() => setSelectedInspection(null)} className="rounded p-1 text-slate hover:bg-canvas hover:text-ink">
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-canvas p-3 rounded-lg border border-border">
                <div>
                  <span className="text-[10px] text-slate font-bold uppercase">Status</span>
                  <div className="mt-0.5"><StatusBadge status={selectedInspection.status} /></div>
                </div>
                <div>
                  <span className="text-[10px] text-slate font-bold uppercase">Scheduled</span>
                  <p className="font-mono text-ink font-bold mt-0.5">{selectedInspection.scheduledDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate font-bold uppercase">Mine Facility</span>
                  <p className="font-bold text-ink mt-0.5 truncate">{selectedInspection.mineName || selectedInspection.mineId}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate font-bold uppercase">Inspector</span>
                  <p className="font-bold text-ink mt-0.5 truncate">{selectedInspection.inspectorName || "Field Officer"}</p>
                </div>
              </div>

              {selectedInspection.summary && (
                <div>
                  <h4 className="font-bold text-xs text-ink mb-1">Executive Summary</h4>
                  <p className="text-slate bg-slate-50 p-3 rounded-lg border border-border leading-relaxed">
                    {selectedInspection.summary}
                  </p>
                </div>
              )}

              {/* Recorded Observations */}
              <div>
                <h4 className="font-bold text-xs text-ink mb-2">Recorded Field Observations</h4>
                {!selectedInspection.observations || selectedInspection.observations.length === 0 ? (
                  <p className="text-slate text-[11px] p-3 rounded bg-canvas border border-border">
                    No physical observations recorded during this audit run.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedInspection.observations.map((obs, idx) => (
                      <div key={obs.id || idx} className="rounded-lg border border-border bg-canvas p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink">{obs.location}</span>
                          <SeverityBadge severity={obs.severity} />
                        </div>
                        <p className="text-slate text-[11px]">{obs.description}</p>
                        {obs.recommendations && (
                          <p className="text-blue-900 text-[10px] font-medium bg-blue-50/70 p-1.5 rounded border border-blue-100">
                            <strong>Remediation:</strong> {obs.recommendations}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  onClick={() => setSelectedInspection(null)}
                  className="rounded bg-slate-800 px-4 py-1.5 font-semibold text-white hover:bg-slate-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Inspection Modal */}
      {showCreateModal && (
        <CreateInspectionModal
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
