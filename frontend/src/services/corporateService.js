import { api } from "./api.js";

export const corporateService = {
  getCorporateDashboard: async () => {
    return api.get("/dashboard/corporate");
  },

  getSummaryReport: async () => {
    return api.get("/reports/summary");
  },
};

export const notificationService = {
  getNotifications: async () => {
    return api.get("/notifications");
  },

  markRead: async (id) => {
    return api.put(`/notifications/${id}/read`, {});
  },

  markAllRead: async () => {
    return api.post("/notifications/read-all", {});
  },
};
