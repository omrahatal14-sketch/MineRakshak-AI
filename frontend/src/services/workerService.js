import { api } from "./api.js";

const DEFAULT_ATTENDANCE = [
  {
    id: "att-default-1",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    shift: "Shift A (06:00 - 14:00)",
    checkInTime: "05:52 AM",
    checkOutTime: "02:08 PM",
    checkInCoords: { lat: "22.3094", lng: "82.6792" },
    checkOutCoords: { lat: "22.3091", lng: "82.6795" },
    status: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "att-default-2",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    shift: "Shift A (06:00 - 14:00)",
    checkInTime: "05:58 AM",
    checkOutTime: "02:02 PM",
    checkInCoords: { lat: "22.3090", lng: "82.6788" },
    checkOutCoords: { lat: "22.3093", lng: "82.6790" },
    status: "completed",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const DEFAULT_TASKS = [
  {
    id: "wt-101",
    title: "Clear loose coal debris from Face 2 conveyor return idlers",
    zone: "Face 2 / Pit Bottom",
    priority: "High",
    deadline: new Date(Date.now() + 4 * 3600000).toISOString(),
    status: "pending",
  },
  {
    id: "wt-102",
    title: "Inspect primary sump pump water level and grease bearings",
    zone: "Main Sump Station",
    priority: "Medium",
    deadline: new Date(Date.now() + 6 * 3600000).toISOString(),
    status: "pending",
  },
  {
    id: "wt-103",
    title: "Verify secondary emergency trip wire tension on Conveyor 3B",
    zone: "Haulage Sub-level 1",
    priority: "Low",
    deadline: new Date(Date.now() + 12 * 3600000).toISOString(),
    status: "completed",
  },
];

const DEFAULT_REPORTS = [
  {
    id: "rep-101",
    title: "Loose Rock Spall on Pit 2 Bench 3 Outer Haul Road",
    description: "Spalled sandstone boulders rolling onto primary dumper corridor. Requires road grader clearance.",
    category: "Haul Road / Bench",
    severity: "medium",
    location: "22.3092, 82.6794",
    imageUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=400&q=80",
    submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "in-review",
  },
];

const DEFAULT_TRAINING = [
  {
    id: "tr-101",
    title: "DGMS Opencast Slope & Bench Safety Protocol (CMR 2017)",
    progress: 100,
    status: "completed",
    lastAccessed: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "tr-102",
    title: "Conveyor Lockout-Tagout (LOTO) & Pinch Point Safety",
    progress: 100,
    status: "completed",
    lastAccessed: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "tr-103",
    title: "Heavy Machinery (HEMM) Proximity & Blind Spot Rules",
    progress: 45,
    status: "in-progress",
    lastAccessed: new Date().toISOString(),
  },
];

function getStored(key, defaultVal) {
  if (typeof window === "undefined") return defaultVal;
  try {
    const raw = localStorage.getItem(`minerakshak_${key}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultVal;
}

function setStored(key, val) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`minerakshak_${key}`, JSON.stringify(val));
    } catch {}
  }
}

export const workerService = {
  // Attendance
  getAttendanceHistory: async () => {
    try {
      const res = await api.get("/worker/attendance");
      if (Array.isArray(res) && res.length > 0) {
        setStored("worker_attendance", res);
        return res;
      }
    } catch {}
    return getStored("worker_attendance", DEFAULT_ATTENDANCE);
  },

  checkIn: async (shift, coords) => {
    try {
      const res = await api.post("/worker/attendance/checkin", { shift, coords });
      if (res && res.id) return res;
    } catch {}

    const entry = {
      id: `att_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      shift: shift || "Shift A (06:00 - 14:00)",
      checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      checkInCoords: coords || { lat: "22.3094", lng: "82.6792" },
      checkOutTime: null,
      checkOutCoords: null,
      status: "present",
      createdAt: new Date().toISOString(),
    };
    const current = getStored("worker_attendance", DEFAULT_ATTENDANCE);
    setStored("worker_attendance", [entry, ...current]);
    return entry;
  },

  checkOut: async (attendanceId, coords) => {
    try {
      const res = await api.post("/worker/attendance/checkout", { attendanceId, coords });
      if (res && res.id) return res;
    } catch {}

    const current = getStored("worker_attendance", DEFAULT_ATTENDANCE);
    const updated = current.map((a) => {
      if (a.id === attendanceId) {
        return {
          ...a,
          checkOutTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          checkOutCoords: coords || { lat: "22.3094", lng: "82.6792" },
          status: "completed",
        };
      }
      return a;
    });
    setStored("worker_attendance", updated);
    return updated.find((a) => a.id === attendanceId) || current[0];
  },

  // PPE Checklist
  getPpeCompliance: async () => {
    try {
      const res = await api.get("/worker/ppe");
      if (res && typeof res === "object") {
        setStored("worker_ppe", res);
        return res;
      }
    } catch {}
    return getStored("worker_ppe", {
      verifiedAt: new Date().toISOString(),
      checklist: { helmet: true, boots: true, vest: true, gloves: true, mask: true, ears: true, rescuer: true },
    });
  },

  savePpeCompliance: async (checklist) => {
    const record = {
      id: `ppe_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      checklist,
      verifiedAt: new Date().toISOString(),
    };
    try {
      const res = await api.post("/worker/ppe", { checklist });
      if (res && res.id) {
        setStored("worker_ppe", res);
        return res;
      }
    } catch {}
    setStored("worker_ppe", record);
    return record;
  },

  // Safety Tasks
  getTasks: async () => {
    try {
      const res = await api.get("/worker/tasks");
      if (Array.isArray(res) && res.length > 0) {
        setStored("worker_tasks", res);
        return res;
      }
    } catch {}
    return getStored("worker_tasks", DEFAULT_TASKS);
  },

  updateTaskStatus: async (taskId, status) => {
    try {
      const res = await api.post(`/worker/tasks/${taskId}/status`, { status });
      if (Array.isArray(res)) {
        setStored("worker_tasks", res);
        return res;
      }
    } catch {}

    const current = getStored("worker_tasks", DEFAULT_TASKS);
    const updated = current.map((t) => (t.id === taskId ? { ...t, status } : t));
    setStored("worker_tasks", updated);
    return updated;
  },

  // Hazard Reports
  getReports: async () => {
    try {
      const data = await api.get("/incidents");
      if (Array.isArray(data) && data.length > 0) {
        const filtered = data.filter((inc) => inc.source === "worker_report" || inc.type === "worker_report");
        if (filtered.length > 0) return filtered;
      }
    } catch {}
    return getStored("worker_reports", DEFAULT_REPORTS);
  },

  submitHazardReport: async (payload) => {
    const newRep = {
      id: `rep_${Date.now()}`,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      severity: payload.severity,
      location: payload.location || "22.3094, 82.6792",
      imageUrl: payload.imageUrl || null,
      submittedAt: new Date().toISOString(),
      status: "in-review",
    };

    try {
      await api.post("/incidents/dispatch", {
        ...payload,
        type: "worker_report",
        source: "worker_report",
        customDeadline: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      });
    } catch {}

    const current = getStored("worker_reports", DEFAULT_REPORTS);
    setStored("worker_reports", [newRep, ...current]);
    return newRep;
  },

  // Emergency SOS
  triggerEmergencySos: async (coords, workerInfo) => {
    try {
      await api.post("/notifications", {
        type: "SOS_ALERT",
        title: "CRITICAL: WORKER EMERGENCY SOS TRIGGERED",
        message: `Emergency SOS triggered by ${workerInfo.name} at GPS ${coords.lat}, ${coords.lng}`,
        priority: "critical",
        recipients: ["mine_official", "field_officer"],
      });
    } catch {}

    return {
      id: `sos_${Date.now()}`,
      triggeredAt: new Date().toISOString(),
      coords,
      worker: workerInfo,
      status: "dispatched",
    };
  },

  // Training
  getTrainingModules: async () => {
    try {
      const res = await api.get("/worker/training");
      if (Array.isArray(res) && res.length > 0) {
        setStored("worker_training", res);
        return res;
      }
    } catch {}
    return getStored("worker_training", DEFAULT_TRAINING);
  },

  updateTrainingProgress: async (moduleId, progress) => {
    try {
      const res = await api.post(`/worker/training/${moduleId}/progress`, { progress });
      if (Array.isArray(res)) {
        setStored("worker_training", res);
        return res;
      }
    } catch {}

    const current = getStored("worker_training", DEFAULT_TRAINING);
    const updated = current.map((t) => (t.id === moduleId ? { ...t, progress, status: progress === 100 ? "completed" : "in-progress" } : t));
    setStored("worker_training", updated);
    return updated;
  },
};
