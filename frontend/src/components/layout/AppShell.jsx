import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import CreateInspectionModal from "../../pages/inspections/CreateInspectionModal.jsx";
import AiIncidentModal from "../incidents/AiIncidentModal.jsx";
import { notificationService } from "../../services/corporateService.js";

const ROLE_LABELS = {
  field_officer: "Field Officer",
  mine_official: "Mine Official",
  corporate: "Corporate Management",
  admin: "System Admin",
};

export default function AppShell({ title, children, onInspectionCreated }) {
  const { profile, logout } = useAuth();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiIncidentModal, setShowAiIncidentModal] = useState(false);

  // Notifications dropdown state
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const notifs = await notificationService.getNotifications();
        setNotifications(notifs || []);
      } catch (err) {}
    }
    if (profile) fetchNotifs();
  }, [profile]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const homePath =
    profile?.role === "field_officer"
      ? "/field-officer"
      : profile?.role === "mine_official"
      ? "/mine-official"
      : profile?.role === "corporate"
      ? "/corporate"
      : "/admin";

  const isMineOfficial = profile?.role === "mine_official";
  const canCreateInspection = ["admin", "mine_official"].includes(profile?.role);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-5">
            <Link to={homePath} className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-sm transition group-hover:bg-primary-dark">
                MR
              </div>
              <div>
                <p className="text-sm font-bold leading-tight text-ink">MineRakshak AI</p>
                <p className="text-[11px] font-medium text-slate">
                  {ROLE_LABELS[profile?.role] || "Platform User"}
                  {profile?.mineId ? ` • ${profile.mineId}` : ""}
                </p>
              </div>
            </Link>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-4 border-l border-border pl-4">
              <Link
                to={homePath}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                  location.pathname === homePath
                    ? "bg-primary-light text-primary"
                    : "text-slate hover:bg-canvas hover:text-ink"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/inspections"
                className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                  location.pathname.startsWith("/inspections")
                    ? "bg-primary-light text-primary"
                    : "text-slate hover:bg-canvas hover:text-ink"
                }`}
              >
                {profile?.role === "field_officer" ? "My Inspections" : "Inspections"}
              </Link>
              <Link
                to="/corrective-actions"
                className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                  location.pathname.startsWith("/corrective-actions")
                    ? "bg-primary-light text-primary"
                    : "text-slate hover:bg-canvas hover:text-ink"
                }`}
              >
                Corrective Actions
              </Link>
            </nav>
          </div>

          {/* Actions, Notifications & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {isMineOfficial && (
              <button
                type="button"
                onClick={() => setShowAiIncidentModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">AI Incident Vision</span>
              </button>
            )}

            {canCreateInspection && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="hidden lg:inline-flex items-center gap-1.5 rounded border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-xs hover:bg-slate-50 transition"
              >
                + Schedule Audit
              </button>
            )}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative rounded p-1.5 text-slate hover:bg-canvas hover:text-ink transition"
                title="Notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 font-mono text-[9px] font-bold text-white shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-border bg-surface shadow-xl z-50 p-3">
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                    <span className="text-xs font-bold text-ink">Notifications ({unreadCount} new)</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                    {notifications.length === 0 ? (
                      <p className="text-center py-4 text-slate text-[11px]">No notifications right now.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`rounded p-2.5 transition border ${
                            n.isRead ? "bg-canvas border-transparent text-slate" : "bg-blue-50/50 border-blue-100 text-ink"
                          }`}
                        >
                          <p className="font-semibold text-xs leading-tight">{n.title}</p>
                          <p className="text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="mt-1 block font-mono text-[9px] text-slate">
                            {n.createdAt ? new Date(n.createdAt._seconds ? n.createdAt._seconds * 1000 : n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold leading-none text-ink">{profile?.name || "User"}</p>
                <p className="mt-0.5 text-[10px] text-slate">{profile?.email || ""}</p>
              </div>
              <button
                onClick={logout}
                className="rounded border border-border px-2.5 py-1 text-xs font-medium text-slate hover:bg-canvas hover:text-ink transition"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {title && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
            {isMineOfficial && (
              <button
                type="button"
                onClick={() => setShowAiIncidentModal(true)}
                className="sm:hidden inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs"
              >
                Capture Incident (AI Vision)
              </button>
            )}
          </div>
        )}
        {children}
      </main>

      {/* Schedule Inspection Modal */}
      {showCreateModal && (
        <CreateInspectionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(newInsp) => {
            setShowCreateModal(false);
            if (onInspectionCreated) onInspectionCreated(newInsp);
          }}
        />
      )}

      {/* AI Incident Vision Modal */}
      {showAiIncidentModal && (
        <AiIncidentModal
          onClose={() => setShowAiIncidentModal(false)}
          onDispatched={(res) => {
            setShowAiIncidentModal(false);
            if (onInspectionCreated) onInspectionCreated(res);
          }}
        />
      )}
    </div>
  );
}
