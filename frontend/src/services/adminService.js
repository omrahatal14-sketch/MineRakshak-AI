import { api } from "./api.js";

export const adminService = {
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.role && params.role !== "all") query.set("role", params.role);
    if (params.mine && params.mine !== "all") query.set("mine", params.mine);
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return api.get(`/users${queryString}`);
  },

  createUser: async (data) => {
    return api.post("/users", data);
  },

  updateUser: async (uid, data) => {
    return api.put(`/users/${uid}`, data);
  },

  deactivateUser: async (uid) => {
    return api.delete(`/users/${uid}`);
  },

  getMines: async () => {
    return api.get("/mines");
  },

  createMine: async (data) => {
    return api.post("/mines", data);
  },

  updateMine: async (id, data) => {
    return api.put(`/mines/${id}`, data);
  },

  getAuditLogs: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.action && params.action !== "all") query.set("action", params.action);
    if (params.entityType && params.entityType !== "all") query.set("entityType", params.entityType);
    if (params.limit) query.set("limit", params.limit);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return api.get(`/audit-logs${queryString}`);
  },
};
