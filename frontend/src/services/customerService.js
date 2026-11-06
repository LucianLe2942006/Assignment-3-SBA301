import axiosClient from "../api/axiosClient";

export const customerService = {
  getAll: async (search = "") => {
    const params = search ? { search } : {};
    return await axiosClient.get("/customers", { params });
  },

  getById: async (id) => {
    return await axiosClient.get(`/customers/${id}`);
  },

  create: async (data) => {
    return await axiosClient.post("/customers", data);
  },

  update: async (id, data) => {
    return await axiosClient.put(`/customers/${id}`, data);
  },

  delete: async (id) => {
    return await axiosClient.delete(`/customers/${id}`);
  },

  getProfile: async () => {
    return await axiosClient.get("/customers/profile");
  },

  updateProfile: async (data) => {
    return await axiosClient.put("/customers/profile", data);
  }
};
