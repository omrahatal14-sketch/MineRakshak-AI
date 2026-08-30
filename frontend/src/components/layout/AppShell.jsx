"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext.jsx";
import CreateInspectionModal from "../modals/CreateInspectionModal.jsx";
import AiIncidentModal from "../incidents/AiIncidentModal.jsx";
import { notificationService } from "../../services/corporateService.js";
import {
  LayoutDashboard, ClipboardCheck, Search as SearchIcon, ShieldCheck, MapPin,
  FileText, BarChart3, ScrollText, Bell, Menu, X,
} from "lucide-react";

const ROLE_LABELS = {
  field_officer: "Field Officer",
  mine_official: "Mine Official",
  contractor: "Contractor Company",
  corporate: "Corporate Management",
  admin: "System Admin",
};

function NavItem({ href, icon: Icon, label, active, collapsed }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
        active
          ? "bg-primary text-white shadow-sm"
          : "text-slate hover:bg-canvas hover:text-ink"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export default function AppShell({ title, children, onInspectionCreated }) {
  const { profile, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiIncidentModal, setShowAiIncidentModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const homePath =
    profile?.role === "field_officer"
      ? "/field-officer"
      : profile?.role === "mine_official"
      ? "/mine-official"
      : profile?.role === "contractor"
      ? "/contractor"
      : profile?.role === "corporate"
      ? "/corporate"
      : "/admin";

  const isMineOfficial = profile?.role === "mine_official";
  const canCreateInspection = ["admin", "mine_official"].includes(profile?.role);

  // Navigation items per role
  const navItems = [
    { href: homePath, icon: LayoutDashboard, label: "Dashboard", roles: ["field_officer", "mine_official", "contractor", "corporate", "admin"] },
    { href: "/inspections", icon: SearchIcon, label: "Inspections", roles: ["field_officer", "mine_official", "corporate", "admin"] },
    { href: "/corrective-actions", icon: ShieldCheck, label: "My Tasks", roles: ["contractor"] },
    { href: "/corrective-actions", icon: ShieldCheck, label: "Corrective Actions", roles: ["field_officer", "mine_official", "corporate", "admin"] },
    { href: "/compliance", icon: ClipboardCheck, label: "Compliance", roles: ["field_officer", "mine_official", "corporate", "admin"] },
    { href: "/map", icon: MapPin, label: "GIS Map", roles: ["mine_official", "corporate", "admin"] },
    { href: "/documents", icon: FileText, label: "Documents / OCR", roles: ["field_officer", "mine_official", "corporate", "admin"] },
    { href: "/reports", icon: BarChart3, label: "Reports", roles: ["mine_official", "corporate", "admin"] },
    { href: "/audit-trail", icon: ScrollText, label: "Audit Trail", roles: ["corporate", "admin"] },
  ].filter((item) => item.roles.includes(profile?.role));

  return (
    <div className="min-h-screen bg-canvas">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface shadow-xs">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Hamburger + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden rounded p-1.5 text-slate hover:bg-canvas hover:text-ink transition"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href={homePath} className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-sm transition group-hover:bg-primary-dark">
                MR
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-tight text-ink">MineRakshak AI</p>
                <p className="text-[11px] font-medium text-slate">
                  {ROLE_LABELS[profile?.role] || "Platform User"}
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Actions + Notifications + Profile */}
          <div className="flex items-center gap-2.5">
            {isMineOfficial && (
              <button
                type="button"
                onClick={() => setShowAiIncidentModal(true)}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition"
              >
                AI Incident Vision
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

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative rounded-lg p-2 text-slate hover:bg-canvas hover:text-ink transition"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 font-mono text-[9px] font-bold text-white shadow-xs animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-surface shadow-2xl z-50 p-3 animate-slideDown">
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
                            className={`rounded-lg p-2.5 transition border ${
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
                </>
              )}
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold leading-none text-ink">{profile?.name || "User"}</p>
                <p className="mt-0.5 text-[10px] text-slate">{profile?.email || ""}</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded border border-border px-2.5 py-1 text-xs font-medium text-slate hover:bg-canvas hover:text-ink transition"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky top-[61px] left-0 z-20 h-[calc(100vh-61px)] w-56 border-r border-border bg-surface shadow-lg lg:shadow-none transition-transform duration-300`}>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={
                  item.href === homePath
                    ? pathname === homePath
                    : pathname.startsWith(item.href)
                }
              />
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-4 left-3 right-3">
            <div className="rounded-lg bg-canvas border border-border p-3">
              <p className="text-[10px] font-semibold text-slate uppercase tracking-wider">Platform</p>
              <p className="text-[11px] font-bold text-ink mt-0.5">MineRakshak AI</p>
              <p className="text-[10px] text-slate mt-0.5">Smart Compliance Platform</p>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 max-w-6xl mx-auto w-full">
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
      </div>

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
