import axiosClient from "../api/axiosClient";

export const authService = {
  login: async (email, password) => {
    return await axiosClient.post("/auth/login", { email, password });
  },

  register: async (data) => {
    return await axiosClient.post("/auth/register", data);
  }
};
