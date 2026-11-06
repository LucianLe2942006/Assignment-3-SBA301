import axiosClient from "../api/axiosClient";

export const systemService = {
  resetDatabase: async () => {
    return await axiosClient.post("/system/reset-data");
  },

  getStatus: async () => {
    return await axiosClient.get("/system/status");
  }
};
