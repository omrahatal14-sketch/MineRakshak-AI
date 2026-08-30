"use client";

import { useState, useEffect } from "react";
import AppShell from "../../src/components/layout/AppShell.jsx";
import { useAuth } from "../../src/context/AuthContext.jsx";
import { auditService } from "../../src/services/moduleServices.js";
import { ScrollText, ShieldCheck, Filter, RefreshCw, Clock, User, FileCode } from "lucide-react";

export default function AuditTrailPage() {
  const { profile } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("all");

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await auditService.getLogs({
        entityType: entityFilter !== "all" ? entityFilter : undefined,
        limit: 100,
      });
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, [entityFilter]);

  return (
    <AppShell title="Immutable Statutory Audit Trail">
      {/* Top Banner */}
      <div className="card mb-6 p-4 bg-canvas flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-ink">Tamper-Evident Governance Log</h3>
          </div>
          <p className="text-xs text-slate">Every incident dispatch, inspector verification, user management change, and document upload is immutably recorded.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate">Entity:</span>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="rounded border border-border bg-white px-2.5 py-1.5 text-xs text-ink focus:border-primary focus:outline-none"
            >
              <option value="all">All Entities</option>
              <option value="incident">Incidents & Hazards</option>
              <option value="correctiveAction">Corrective Actions (CAPA)</option>
              <option value="inspection">Statutory Inspections</option>
              <option value="document">Document Uploads</option>
              <option value="user">User Accounts</option>
              <option value="mine">Mine Facilities</option>
            </select>
          </div>
          <button
            onClick={loadLogs}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-slate hover:bg-canvas hover:text-ink transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="card text-center py-16 text-xs text-slate">Loading immutable audit trail…</div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-16 text-xs text-slate">No audit records recorded for this filter.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
          <table className="min-w-full divide-y divide-border text-left text-xs font-mono">
            <thead className="bg-canvas font-sans font-semibold text-slate uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp (UTC)</th>
                <th className="px-4 py-3">Actor / Authority</th>
                <th className="px-4 py-3">Action Event</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3">Audit Details / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface text-[11px]">
              {logs.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3 text-slate whitespace-nowrap">
                    {log.createdAt
                      ? new Date(log.createdAt._seconds ? log.createdAt._seconds * 1000 : log.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <span className="font-bold text-ink">{log.actorId}</span>
                    <span className="block text-[10px] text-slate font-mono uppercase">{log.actorRole || "system"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate border border-border uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-slate">
                    <strong>{log.entityType}</strong> {log.entityId ? `(${log.entityId})` : ""}
                  </td>
                  <td className="px-4 py-3 font-sans text-slate text-[11px] max-w-sm truncate">
                    {log.newValue ? JSON.stringify(log.newValue) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
