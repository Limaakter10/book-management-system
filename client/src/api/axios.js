import axios from "axios";

const baseURL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://book-management-system-ks6w.onrender.com";

const api = axios.create({ baseURL });

// ✅ প্রতিটি request এ automatically token add হবে
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;