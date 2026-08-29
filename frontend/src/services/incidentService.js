import { api } from "./api.js";

export const incidentService = {
  analyzeHazardImage: async ({ fileName, contextText, mineId }) => {
    return api.post("/incidents/ai-analyze", { fileName, contextText, mineId });
  },

  dispatchIncident: async (payload) => {
    return api.post("/incidents/dispatch", payload);
  },
};
