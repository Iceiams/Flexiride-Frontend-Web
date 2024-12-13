import axios from "axios";

const api = axios.create({
  baseURL: "https://flexiride.onrender.com/admin",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Sử dụng interceptor để thêm token vào header Authorization
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
