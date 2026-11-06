import axiosClient from "../api/axiosClient";

export const bookingService = {
  getAll: async (search = "", status = "") => {
    const params = {};
    if (search) params.search = search;
    if (status !== "" && status !== null) params.status = status;
    return await axiosClient.get("/bookings", { params });
  },

  getMyHistory: async () => {
    return await axiosClient.get("/bookings/my-history");
  },

  getById: async (id) => {
    return await axiosClient.get(`/bookings/${id}`);
  },

  create: async (data) => {
    return await axiosClient.post("/bookings", data);
  },

  update: async (id, data) => {
    return await axiosClient.put(`/bookings/${id}`, data);
  },

  delete: async (id) => {
    return await axiosClient.delete(`/bookings/${id}`);
  }
};
