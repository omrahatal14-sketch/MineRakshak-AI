import { api } from "./api.js";

const DEFAULT_WORKER_TASKS = [
  { id: "wt-101", title: "Clear loose coal debris from Face 2 conveyor return idlers", zone: "Face 2 / Pit Bottom", priority: "High", deadline: new Date(Date.now() + 4 * 3600000).toISOString(), status: "pending" },
  { id: "wt-102", title: "Inspect primary sump pump water level and grease bearings", zone: "Main Sump Station", priority: "Medium", deadline: new Date(Date.now() + 6 * 3600000).toISOString(), status: "pending" },
  { id: "wt-103", title: "Replace damaged reflective delineators on Haul Road B switchback", zone: "Haul Road Sector B", priority: "Low", deadline: new Date(Date.now() + 12 * 3600000).toISOString(), status: "completed" },
];

const DEFAULT_WORKER_TRAINING = [
  { id: "tr-01", title: "DGMS Opencast Slope & Bench Safety Protocol", progress: 100, status: "completed", lastAccessed: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: "tr-02", title: "Conveyor Lockout-Tagout (LOTO) & Pinch Point Safety", progress: 100, status: "completed", lastAccessed: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: "tr-03", title: "Heavy Machinery (HEMM) Proximity & Blind Spot Rules", progress: 45, status: "in-progress", lastAccessed: new Date().toISOString() },
  { id: "tr-04", title: "Underground Self-Rescuer & Emergency Evacuation SOP", progress: 0, status: "pending", lastAccessed: null },
];

function getStored(key, defaultData) {
  if (typeof window === "undefined") return defaultData;
  try {
    const data = localStorage.getItem(key);
    if (data) return JSON.parse(data);
  } catch {}
  return defaultData;
}

function saveStored(key, data) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }
}

export const workerService = {
  // Attendance
  getAttendanceHistory: async () => {
    return getStored("minerakshak_worker_attendance", []);
  },
  
  checkIn: async (shift, coords) => {
    const history = getStored("minerakshak_worker_attendance", []);
    const entry = {
      id: `att_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      shift,
      checkInTime: new Date().toLocaleTimeString(),
      checkInCoords: coords,
      checkOutTime: null,
      status: "present",
    };
    saveStored("minerakshak_worker_attendance", [entry, ...history]);
    return entry;
  },

  checkOut: async (attendanceId, coords) => {
    let history = getStored("minerakshak_worker_attendance", []);
    let updatedEntry = null;
    history = history.map(att => {
      if (att.id === attendanceId) {
        updatedEntry = { ...att, checkOutTime: new Date().toLocaleTimeString(), checkOutCoords: coords, status: "completed" };
        return updatedEntry;
      }
      return att;
    });
    saveStored("minerakshak_worker_attendance", history);
    return updatedEntry;
  },

  // PPE Checklist
  getPpeCompliance: async () => {
    return getStored("minerakshak_worker_ppe", null);
  },

  savePpeCompliance: async (checklist) => {
    const record = {
      date: new Date().toISOString().split("T")[0],
      checklist,
      verifiedAt: new Date().toISOString(),
    };
    saveStored("minerakshak_worker_ppe", record);
    return record;
  },

  // Safety Tasks
  getTasks: async () => {
    return getStored("minerakshak_worker_tasks", DEFAULT_WORKER_TASKS);
  },

  updateTaskStatus: async (taskId, status) => {
    let tasks = getStored("minerakshak_worker_tasks", DEFAULT_WORKER_TASKS);
    tasks = tasks.map(t => t.id === taskId ? { ...t, status } : t);
    saveStored("minerakshak_worker_tasks", tasks);
    return tasks;
  },

  // Hazard Reports
  getReports: async () => {
    return getStored("minerakshak_worker_reports", []);
  },

  submitHazardReport: async (payload) => {
    const reports = getStored("minerakshak_worker_reports", []);
    const newReport = {
      id: `rep_${Date.now()}`,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      severity: payload.severity,
      location: payload.location, // GPS coords string
      imageUrl: payload.imageUrl || null,
      submittedAt: new Date().toISOString(),
      status: "in-review",
    };
    saveStored("minerakshak_worker_reports", [newReport, ...reports]);
    
    // In a real app, this would also trigger API call to create a central violation/incident
    try {
      await api.post("/incidents/dispatch", { ...payload, type: "worker_report" });
    } catch (e) {
      // Fallback caught
    }
    return newReport;
  },

  // Emergency SOS
  triggerEmergencySos: async (coords, workerInfo) => {
    const sosLog = {
      id: `sos_${Date.now()}`,
      triggeredAt: new Date().toISOString(),
      coords,
      worker: workerInfo,
      status: "dispatched",
    };
    // Log locally
    const history = getStored("minerakshak_worker_sos", []);
    saveStored("minerakshak_worker_sos", [sosLog, ...history]);

    // Attempt to notify API
    try {
      await api.post("/notifications", {
        type: "SOS_ALERT",
        title: "CRITICAL: WORKER EMERGENCY SOS TRIGGERED",
        message: `Emergency SOS triggered by ${workerInfo.name} at GPS ${coords.lat}, ${coords.lng}`,
        priority: "critical",
        recipients: ["mine_official", "field_officer"]
      });
    } catch (e) {}

    return sosLog;
  },

  // Training
  getTrainingModules: async () => {
    return getStored("minerakshak_worker_training", DEFAULT_WORKER_TRAINING);
  },
  
  updateTrainingProgress: async (moduleId, progress) => {
    let modules = getStored("minerakshak_worker_training", DEFAULT_WORKER_TRAINING);
    modules = modules.map(m => m.id === moduleId ? { ...m, progress, status: progress === 100 ? "completed" : "in-progress", lastAccessed: new Date().toISOString() } : m);
    saveStored("minerakshak_worker_training", modules);
    return modules;
  }
};
