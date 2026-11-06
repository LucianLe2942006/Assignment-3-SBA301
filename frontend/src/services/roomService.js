import axiosClient from "../api/axiosClient";

export const roomService = {
  getAll: async (search = "", roomTypeId = "", status = "") => {
    const params = {};
    if (search) params.search = search;
    if (roomTypeId !== "" && roomTypeId !== null) params.roomTypeId = roomTypeId;
    if (status !== "" && status !== null) params.status = status;
    return await axiosClient.get("/rooms", { params });
  },

  getById: async (id) => {
    return await axiosClient.get(`/rooms/${id}`);
  },

  create: async (data) => {
    return await axiosClient.post("/rooms", data);
  },

  update: async (id, data) => {
    return await axiosClient.put(`/rooms/${id}`, data);
  },

  delete: async (id) => {
    return await axiosClient.delete(`/rooms/${id}`);
  },

  getRoomTypes: async () => {
    return await axiosClient.get("/room-types");
  }
};
