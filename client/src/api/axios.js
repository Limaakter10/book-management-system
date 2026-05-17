import axios from "axios";

const api = axios.create({
  baseURL: "https://book-management-system-ks6w.onrender.com"
});

export default api;