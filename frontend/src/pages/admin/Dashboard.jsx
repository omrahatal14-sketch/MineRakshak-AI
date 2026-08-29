import { useState, useEffect } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import { adminService } from "../../services/adminService.js";
import UserModal from "./UserModal.jsx";
import MineModal from "./MineModal.jsx";

const ROLE_DISPLAY = {
  field_officer: { label: "Field Officer", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  mine_official: { label: "Mine Official", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  corporate: { label: "Corporate", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  admin: { label: "Administrator", badge: "bg-red-50 text-red-700 border-red-200" },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users"); // "users" | "mines" | "audit"
  const [users, setUsers] = useState([]);
  const [mines, setMines] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingMine, setEditingMine] = useState(null);
  const [showCreateMine, setShowCreateMine] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "users") {
        const data = await adminService.getUsers({ role: roleFilter, search: searchQuery });
        setUsers(data || []);
      } else if (activeTab === "mines") {
        const data = await adminService.getMines();
        setMines(data || []);
      } else if (activeTab === "audit") {
        const data = await adminService.getAuditLogs({ limit: 100 });
        setAuditLogs(data || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load administration data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [activeTab, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleDeactivate = async (uid) => {
    if (!confirm("Are you sure you want to deactivate this user account?")) return;
    try {
      await adminService.deactivateUser(uid);
      loadData();
    } catch (err) {
      alert("Failed to deactivate user: " + err.message);
    }
  };

  return (
    <AppShell title="System Administration & Governance">
      {/* Top Tabs */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: "users", label: "User Management" },
              { id: "mines", label: "Mine Facilities" },
              { id: "audit", label: "System Audit Trail" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-primary text-white shadow-xs"
                    : "bg-canvas text-slate hover:bg-slate-200/70 hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2">
            {activeTab === "users" && (
              <button
                type="button"
                onClick={() => setShowCreateUser(true)}
                className="rounded bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
              >
                + Add User Account
              </button>
            )}
            {activeTab === "mines" && (
              <button
                type="button"
                onClick={() => setShowCreateMine(true)}
                className="rounded bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-dark transition"
              >
                + Register Mine
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-xs text-status-overdue border border-red-200">
          {error}
        </div>
      )}

      {/* TAB 1: USERS */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* User Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate">Filter by Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded border border-border bg-white px-2.5 py-1 text-xs text-ink focus:border-primary focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="field_officer">Field Officers</option>
                <option value="mine_official">Mine Officials</option>
                <option value="corporate">Corporate Users</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email..."
                className="w-48 sm:w-60 rounded border border-border bg-white px-3 py-1 text-xs text-ink focus:border-primary focus:outline-none"
              />
              <button type="submit" className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white">
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="card text-center py-12 text-xs text-slate">Loading user directory…</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
              <table className="min-w-full divide-y divide-border text-left text-xs">
                <thead className="bg-canvas font-semibold text-slate uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Assigned Mine</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {users.map((u) => {
                    const roleInfo = ROLE_DISPLAY[u.role] || { label: u.role, badge: "bg-slate-100 text-slate" };
                    return (
                      <tr key={u.uid} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-ink">{u.name || "Unnamed"}</div>
                          <div className="text-[11px] text-slate">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${roleInfo.badge}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate">
                          {u.mineName || u.mineId || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            u.status === "inactive" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {u.status || "active"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            className="rounded border border-border px-2.5 py-1 text-xs font-medium text-slate hover:bg-canvas hover:text-ink"
                          >
                            Edit
                          </button>
                          {u.status !== "inactive" && (
                            <button
                              type="button"
                              onClick={() => handleDeactivate(u.uid)}
                              className="rounded border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MINES */}
      {activeTab === "mines" && (
        <div className="space-y-4">
          {loading ? (
            <div className="card text-center py-12 text-xs text-slate">Loading mine directory…</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
              <table className="min-w-full divide-y divide-border text-left text-xs">
                <thead className="bg-canvas font-semibold text-slate uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Mine Facility</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Zone / State</th>
                    <th className="px-4 py-3">Coordinates (Lat, Long)</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {mines.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-bold text-ink">{m.name}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate">{m.code || m.id}</td>
                      <td className="px-4 py-3 text-slate">{m.zone}</td>
                      <td className="px-4 py-3 font-mono text-slate text-[11px]">
                        {m.latitude ? `${m.latitude}, ${m.longitude}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase border border-emerald-200">
                          {m.status || "active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingMine(m)}
                          className="rounded border border-border px-2.5 py-1 text-xs font-medium text-slate hover:bg-canvas"
                        >
                          Edit Facility
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SYSTEM AUDIT TRAIL */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink">Statutory Audit Logs</h2>
              <p className="text-xs text-slate">Immutable audit trail of user actions, compliance changes, and verification events.</p>
            </div>
            <button
              onClick={loadData}
              className="rounded border border-border px-3 py-1 text-xs font-medium text-slate hover:bg-canvas"
            >
              Refresh Logs
            </button>
          </div>

          {loading ? (
            <div className="card text-center py-12 text-xs text-slate">Loading audit logs…</div>
          ) : auditLogs.length === 0 ? (
            <div className="card text-center py-8 text-xs text-slate">No audit records logged yet.</div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
              <table className="min-w-full divide-y divide-border text-left text-xs">
                <thead className="bg-canvas font-semibold text-slate uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor / Role</th>
                    <th className="px-4 py-3">Action Event</th>
                    <th className="px-4 py-3">Target Entity</th>
                    <th className="px-4 py-3">Details / Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface font-mono text-[11px]">
                  {auditLogs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-2.5 text-slate whitespace-nowrap">
                        {log.createdAt
                          ? new Date(log.createdAt._seconds ? log.createdAt._seconds * 1000 : log.createdAt).toLocaleString([], { dateStyle: "short", timeStyle: "medium" })
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5 font-sans">
                        <span className="font-bold text-ink">{log.actorId}</span>
                        <span className="block text-[10px] text-slate font-mono uppercase">{log.actorRole || "system"}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate border border-border uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-sans text-slate">
                        <strong>{log.entityType}</strong> {log.entityId ? `(${log.entityId})` : ""}
                      </td>
                      <td className="px-4 py-2.5 font-sans text-slate text-[11px] max-w-xs truncate">
                        {log.newValue ? JSON.stringify(log.newValue) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* User Create/Edit Modal */}
      {(showCreateUser || editingUser) && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowCreateUser(false);
            setEditingUser(null);
          }}
          onSaved={() => {
            setShowCreateUser(false);
            setEditingUser(null);
            loadData();
          }}
        />
      )}

      {/* Mine Create/Edit Modal */}
      {(showCreateMine || editingMine) && (
        <MineModal
          mine={editingMine}
          onClose={() => {
            setShowCreateMine(false);
            setEditingMine(null);
          }}
          onSaved={() => {
            setShowCreateMine(false);
            setEditingMine(null);
            loadData();
          }}
        />
      )}
    </AppShell>
  );
}
