import { api } from "./api.js";

export const workerService = {
  // Attendance
  getAttendanceHistory: async () => {
    return api.get("/worker/attendance");
  },
  
  checkIn: async (shift, coords) => {
    return api.post("/worker/attendance/checkin", { shift, coords });
  },

  checkOut: async (attendanceId, coords) => {
    return api.post("/worker/attendance/checkout", { attendanceId, coords });
  },

  // PPE Checklist
  getPpeCompliance: async () => {
    return api.get("/worker/ppe");
  },

  savePpeCompliance: async (checklist) => {
    return api.post("/worker/ppe", { checklist });
  },

  // Safety Tasks
  getTasks: async () => {
    return api.get("/worker/tasks");
  },

  updateTaskStatus: async (taskId, status) => {
    return api.post(`/worker/tasks/${taskId}/status`, { status });
  },

  // Hazard Reports
  getReports: async () => {
    // In our system, hazard reports submitted by workers become 'incidents' or 'violations'.
    // We'll fetch them from the incidents endpoint.
    try {
      const data = await api.get("/incidents");
      return data.filter(inc => inc.source === "worker_report" || inc.type === "worker_report");
    } catch (e) {
      // Fallback if endpoint fails
      return [];
    }
  },

  submitHazardReport: async (payload) => {
    // We dispatch this to the main incident system so Mine Officials see it immediately
    const res = await api.post("/incidents/dispatch", { 
      ...payload, 
      type: "worker_report",
      source: "worker_report",
      customDeadline: new Date(Date.now() + 86400000).toISOString().split("T")[0] // 24 hours
    });
    
    return {
      id: res.violation?.id || `rep_${Date.now()}`,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      severity: payload.severity,
      location: payload.location, 
      imageUrl: payload.imageUrl || null,
      submittedAt: new Date().toISOString(),
      status: "in-review",
    };
  },

  // Emergency SOS
  triggerEmergencySos: async (coords, workerInfo) => {
    // Send to global notifications so Officials and Field Officers are alerted
    const res = await api.post("/notifications", {
      type: "SOS_ALERT",
      title: "CRITICAL: WORKER EMERGENCY SOS TRIGGERED",
      message: `Emergency SOS triggered by ${workerInfo.name} at GPS ${coords.lat}, ${coords.lng}`,
      priority: "critical",
      recipients: ["mine_official", "field_officer"]
    });
    
    return {
      id: res.id || `sos_${Date.now()}`,
      triggeredAt: new Date().toISOString(),
      coords,
      worker: workerInfo,
      status: "dispatched",
    };
  },

  // Training
  getTrainingModules: async () => {
    return api.get("/worker/training");
  },
  
  updateTrainingProgress: async (moduleId, progress) => {
    return api.post(`/worker/training/${moduleId}/progress`, { progress });
  }
};
