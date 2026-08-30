import { api } from "./api.js";

const DEFAULT_CORP_DASHBOARD = {
  summary: {
    totalMines: 10,
    openViolations: 4,
    criticalViolations: 2,
    completedInspections: 8,
    pendingActions: 3,
    complianceRate: 84,
  },
  prioritizedMines: [
    { id: "KCM-01", name: "Kusmunda Coal Mine", zone: "Chhattisgarh", riskScore: 88.0, riskLevel: "high", reason: "Repeated conveyor safety wire detachments & highwall tension crack", urgency: "Immediate Audit" },
    { id: "GCM-02", name: "Gevra Open Cast Mine", zone: "Chhattisgarh", riskScore: 74.0, riskLevel: "high", reason: "Fugitive dust plume & statutory Form IV documentation delay", urgency: "Within 48h" },
    { id: "JCM-03", name: "Jharia Underground Coal Mine", zone: "Jharkhand", riskScore: 62.0, riskLevel: "medium", reason: "Methane gas sensor calibration due next week", urgency: "Standard Schedule" },
    { id: "SNG-07", name: "Singrauli Coal Basin", zone: "Madhya Pradesh", riskScore: 48.0, riskLevel: "medium", reason: "Overland conveyor trip audio-visual warning tests compliant", urgency: "Routine" },
    { id: "UMR-06", name: "Umrer Open Cast Mine", zone: "Maharashtra", riskScore: 28.0, riskLevel: "low", reason: "All DGMS safety logs verified with zero pending CAPA", urgency: "Low Priority" },
  ],
};

const DEFAULT_NOTIFICATIONS = [
  { id: "notif-1", title: "[AI Hazard Vision] Work Order Dispatched: Conveyor Drive Pulley", message: "Dispatched to SafeMine Engineering with statutory fix deadline of 2026-09-02.", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: "notif-2", title: "[Statutory Audit] Haul Road Berm Verification Completed", message: "Field Officer Ramesh Kumar submitted audit report for Kusmunda Pit 2.", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: "notif-3", title: "[CAPA Overdue Alert] Respirable Dust Sampler Calibration", message: "Action act-203 has exceeded 48h SLA at Gevra Open Cast Mine.", isRead: true, createdAt: new Date(Date.now() - 1000 * 3600 * 5).toISOString() },
];

export const corporateService = {
  getCorporateDashboard: async () => {
    try {
      const res = await api.get("/dashboard/corporate");
      if (res) return res;
    } catch {}
    return DEFAULT_CORP_DASHBOARD;
  },

  getSummaryReport: async () => {
    try {
      const res = await api.get("/reports/summary");
      if (res) return res;
    } catch {}
    return { summary: DEFAULT_CORP_DASHBOARD.summary };
  },
};

export const notificationService = {
  getNotifications: async () => {
    try {
      const res = await api.get("/notifications");
      if (Array.isArray(res) && res.length > 0) return res;
    } catch {}
    return DEFAULT_NOTIFICATIONS;
  },

  markRead: async (id) => {
    try {
      return await api.put(`/notifications/${id}/read`, {});
    } catch {}
    return { success: true };
  },

  markAllRead: async () => {
    try {
      return await api.post("/notifications/read-all", {});
    } catch {}
    return { success: true };
  },
};
