import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Dinh kem JWT token vao header Authorization neu da dang nhap
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const saved = localStorage.getItem("fuminihotel_auth");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      // ignore error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xu ly ket qua tra ve va thong bao loi
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
